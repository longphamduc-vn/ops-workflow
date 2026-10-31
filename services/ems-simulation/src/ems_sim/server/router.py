"""Universal router for Nexacro endpoints supporting XML and JSON."""

import json
import logging
import time
from datetime import UTC, datetime

from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse

from ems_sim.builder.response_builder import NexacroResponseBuilder
from ems_sim.config import settings
from ems_sim.database.repository import SimulationRepository
from ems_sim.models.protocol import NexacroRequest, NexacroResponse
from ems_sim.parser.request_parser import NexacroParser
from ems_sim.validator.request_validator import RequestValidator

logger = logging.getLogger(__name__)

nexacro_router = APIRouter()


@nexacro_router.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def dispatch_nexacro_request(full_path: str, request: Request) -> Response:
    """Universal dispatcher for all registered Nexacro API endpoints."""
    start_time = time.perf_counter()
    req_timestamp = datetime.now(UTC)

    # Normalize path
    norm_path = "/" + full_path.lstrip("/")
    method = request.method.upper()

    api_registry = request.app.state.api_registry
    simulation_engine = request.app.state.simulation_engine
    execution_logger = request.app.state.execution_logger
    session_factory = request.app.state.session_factory

    # Determine wire format (XML is default for Nexacro endpoints unless client strictly demands json)
    accept_header = request.headers.get("accept", "").lower()
    content_type_header = request.headers.get("content-type", "").lower()
    raw_body = await request.body()
    body_text = raw_body.decode("utf-8", errors="replace").strip() if raw_body else ""

    is_explicit_json = "application/json" in accept_header and "xml" not in accept_header
    # Default to XML for Nexacro protocol
    respond_xml = (
        not is_explicit_json or "xml" in content_type_header or body_text.startswith("<?xml")
    )

    # Handle built-in simulated Nexacro authentication
    if norm_path in ("/login.do", "/login"):
        sim_session_id = "SIM_SESS_EMS_12345"
        login_xml = (
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            '<Root xmlns="http://www.nexacroplatform.com/platform/dataset">\n'
            '    <Parameters>\n'
            '        <Parameter id="ErrorCode" type="string">0</Parameter>\n'
            '        <Parameter id="errorCode" type="string">0</Parameter>\n'
            '        <Parameter id="ErrorMsg" type="string">LOGIN SUCCESS</Parameter>\n'
            f'        <Parameter id="SESSION_ID" type="string">{sim_session_id}</Parameter>\n'
            '    </Parameters>\n'
            '</Root>'
        )
        resp = Response(content=login_xml, media_type="application/xml; charset=utf-8")
        resp.set_cookie("JSESSIONID", sim_session_id)
        return resp

    # 1. Resolve registered endpoint
    api_def = api_registry.resolve(method, norm_path)
    if not api_def:
        logger.warning(f"Unregistered API endpoint called: {method} {norm_path}")
        duration_ms = (time.perf_counter() - start_time) * 1000
        await execution_logger.log(
            api_id=None,
            method=method,
            path=norm_path,
            status_code=404,
            duration_ms=duration_ms,
            request_time=req_timestamp,
            response_time=datetime.now(UTC),
            execution_result="NOT_FOUND",
            error_message=f"Endpoint '{norm_path}' not registered in API catalog",
        )
        err_resp = NexacroResponse.error(
            f"API endpoint {norm_path} not registered", error_code="-404"
        )
        if respond_xml:
            return Response(
                content=NexacroResponseBuilder.serialize_xml(err_resp),
                status_code=404,
                media_type="application/xml; charset=utf-8",
            )
        return JSONResponse(status_code=404, content=NexacroResponseBuilder.build_dict(err_resp))

    if not api_def.enabled:
        disabled_resp = NexacroResponse.error(
            f"API {api_def.id} is currently disabled", error_code="-503"
        )
        if respond_xml:
            return Response(
                content=NexacroResponseBuilder.serialize_xml(disabled_resp),
                status_code=503,
                media_type="application/xml; charset=utf-8",
            )
        return JSONResponse(
            status_code=503, content=NexacroResponseBuilder.build_dict(disabled_resp)
        )

    # 2. Parse request payload (supports XML and JSON)
    parse_error_msg = None
    try:
        nexacro_req = NexacroParser.parse_payload(raw_body, content_type=content_type_header)
    except Exception as e:
        logger.warning(f"Failed to parse request payload: {e}")
        parse_error_msg = str(e)
        nexacro_req = NexacroRequest()

    raw_req_dict = None
    try:
        raw_req_dict = (
            json.loads(raw_body)
            if (raw_body and not body_text.startswith("<"))
            else {"xml": body_text[:500]}
        )
    except Exception:
        raw_req_dict = {"xml": body_text[:500]}

    # Check for malformed syntax error
    if parse_error_msg and body_text:
        duration_ms = (time.perf_counter() - start_time) * 1000
        await execution_logger.log(
            api_id=api_def.id,
            method=method,
            path=norm_path,
            status_code=400,
            duration_ms=duration_ms,
            request_time=req_timestamp,
            response_time=datetime.now(UTC),
            execution_result="MALFORMED_REQUEST",
            error_message=f"Malformed request payload: {parse_error_msg}",
            request_payload=raw_req_dict,
        )
        err_resp = NexacroResponse.error(
            f"Malformed request payload: {parse_error_msg}", error_code="-400"
        )
        if respond_xml:
            return Response(
                content=NexacroResponseBuilder.serialize_xml(err_resp),
                status_code=400,
                media_type="application/xml; charset=utf-8",
            )
        return JSONResponse(status_code=400, content=NexacroResponseBuilder.build_dict(err_resp))

    # 2.5. Strict Request Structure & Dataset Validation
    if settings.strict_request_validation and not nexacro_req.get_param("_scenario"):
        dataset_registry = getattr(request.app.state, "dataset_registry", None)
        validation_error = RequestValidator.validate(
            api_def=api_def,
            request=nexacro_req,
            dataset_registry=dataset_registry,
        )
        if validation_error:
            logger.warning(f"Request validation failed on {api_def.id}: {validation_error}")
            duration_ms = (time.perf_counter() - start_time) * 1000
            await execution_logger.log(
                api_id=api_def.id,
                method=method,
                path=norm_path,
                status_code=400,
                duration_ms=duration_ms,
                request_time=req_timestamp,
                response_time=datetime.now(UTC),
                execution_result="VALIDATION_FAILED",
                error_message=validation_error,
                request_payload=raw_req_dict,
            )
            err_resp = NexacroResponse.error(
                f"Request validation error: {validation_error}",
                error_code="-400",
            )
            if respond_xml:
                return Response(
                    content=NexacroResponseBuilder.serialize_xml(err_resp),
                    status_code=400,
                    media_type="application/xml; charset=utf-8",
                )
            return JSONResponse(status_code=400, content=NexacroResponseBuilder.build_dict(err_resp))

    # 3. Execute via Simulation Engine
    scenario_id = None
    fixture_id = None
    status_code = 200

    async with session_factory() as session:
        repo = SimulationRepository(session)
        try:
            nexacro_resp, scenario_id, fixture_id = await simulation_engine.execute(
                api_def=api_def,
                request=nexacro_req,
                repo=repo,
            )
            exec_result = "SUCCESS"
            err_msg = None
        except Exception as e:
            logger.error(f"Execution error on {api_def.id}: {e}", exc_info=True)
            nexacro_resp = NexacroResponse.error(f"Simulation engine error: {e}")
            exec_result = "ERROR"
            err_msg = str(e)
            status_code = 500

        # 4. Build response payload (XML or JSON)
        wire_dict = NexacroResponseBuilder.build_dict(nexacro_resp)

        # 5. Log execution
        res_timestamp = datetime.now(UTC)
        duration_ms = (time.perf_counter() - start_time) * 1000

        await execution_logger.log(
            api_id=api_def.id,
            method=method,
            path=norm_path,
            status_code=status_code,
            duration_ms=duration_ms,
            request_time=req_timestamp,
            response_time=res_timestamp,
            execution_result=exec_result,
            repo=repo,
            error_message=err_msg,
            scenario_id=scenario_id,
            fixture_id=fixture_id,
            request_payload=raw_req_dict,
            response_payload=wire_dict,
        )

    if respond_xml:
        xml_output = NexacroResponseBuilder.serialize_xml(nexacro_resp)
        return Response(
            content=xml_output, status_code=status_code, media_type="application/xml; charset=utf-8"
        )

    return JSONResponse(status_code=status_code, content=wire_dict)
