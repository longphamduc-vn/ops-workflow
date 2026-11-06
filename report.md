# Báo cáo Cải tiến Quản lý Phụ tùng (Spare Part EMS 2.0)

---

## PHẦN 1: BÁO CÁO TÁC NGHIỆP CHUẨN HÓA (OPERATIONAL REPORT)

### Tiếng Việt

#### Vấn đề chung
| Hiện trạng | Sau cải tiến |
| :--- | :--- |
| Vận hành phân tán giữa Excel (U-dock) và hệ thống cũ; xung đột khóa file khi truy cập đồng thời. | Hợp nhất trên nền tảng EMS 2.0 tập trung, xử lý đa luồng cho phép truy cập đồng thời. |
| Luồng dữ liệu đứt gãy, thiếu khả năng đồng bộ xuyên suốt toàn bộ vòng đời phụ tùng. | Tự động đồng bộ và chuẩn hóa dữ liệu tức thời xuyên suốt vòng đời phụ tùng nội bộ. |
| Thiếu cơ chế kiểm soát tác vụ tập trung, thất lạc lịch sử giao dịch và dữ liệu kiểm toán. | Số hóa toàn bộ tiến trình tác nghiệp, tự động ghi nhận nhật ký kiểm toán (Audit trail). |

#### 1. Q-Code & báo giá
| Hiện trạng | Sau cải tiến |
| :--- | :--- |
| Không thể tra cứu đồng thời thông số, giá, ảnh và Interlock, gây tỷ lệ từ chối đơn cao. | Tích hợp tra cứu hàng loạt (Mass Search); tự động xác thực Interlock và giá trước khi đặt. |
| Đăng ký Q-Code thủ công từng mã đơn lẻ, quy trình phê duyệt lặp lại gây nghẽn tác vụ. | Khởi tạo hàng loạt mã Q-Code theo lô, tinh gọn quy trình xét duyệt và chuẩn hóa thông số. |

#### 2. Quản lý PO
| Hiện trạng | Sau cải tiến |
| :--- | :--- |
| Trao đổi qua ứng dụng ngoài (Mtalk) gây trôi thông tin, mất dấu vết lịch sử giao dịch. | Tích hợp trao đổi trực tiếp trên hệ thống, gắn liên kết thảo luận vào từng PO item. |
| Theo dõi phân tán qua 4 kênh: Điều chuyển kho, Mua nội bộ, PO tiêu chuẩn, PO khẩn cấp. | Bảng điều khiển hợp nhất cả 4 luồng PO, giám sát toàn diện hạn giao hàng và SLA. |
| Tái khởi tạo đơn thủ công khi bị từ chối, gây đứt gãy chuỗi cung ứng và sót đơn. | Tự động chuyển tiếp đa tầng: Điều chuyển kho nội bộ → Mua nội bộ → PO tiêu chuẩn. |

#### 3. Quản lý tiến độ & chi phí
| Hiện trạng | Sau cải tiến |
| :--- | :--- |
| Requestor phải truy vấn tiến độ ETA thủ công qua LEC; khó nhận biết khi đơn trễ hạn. | LEC cập nhật ETA tập trung; Requestor chủ động theo dõi và nhận diện sớm các bất thường. |
| Khó theo dõi trạng thái xuất kho (kế hoạch, đang xuất, đã xuất) và nguyên nhân vượt hạn mức. | Minh bạch trạng thái xuất kho theo từng mã hàng; bắt buộc giải trình nguyên nhân khi vượt ngân sách. |

#### 4. EBOM
| Hiện trạng | Sau cải tiến |
| :--- | :--- |
| Cấu trúc EBOM phân tán, không đo lường được tiến độ hoàn thiện theo từng cơ cấu máy. | Trực quan hóa cây cấu trúc theo dây chuyền - cơ cấu; hiển thị tỷ lệ hoàn thiện tức thời. |
| Thiếu cơ chế kiểm tra tự động, không phát hiện kịp thời các cụm linh kiện bị thiếu sót. | Áp dụng quy tắc kiểm định (Sanity rules), tự động cảnh báo hoặc chặn khi thiếu cụm linh kiện. |

**Kết quả mong đợi:** Trực quan hóa vòng đời phụ tùng nội bộ, chuẩn hóa tính toàn vẹn dữ liệu, giảm tỷ lệ quá tải hệ thống (loading rate).

---

### English Version (Operational Report)

#### General Issues
| Current State | Future State |
| :--- | :--- |
| Fragmented across Excel (U-dock) and legacy systems; file-lock conflicts during concurrent access. | Unified on centralized EMS 2.0 platform; multi-threaded processing enabling concurrent access. |
| Broken data threads lacking end-to-end synchronization across the spare part lifecycle. | Automated real-time data synchronization and standardization across internal spare part lifecycles. |
| Lack of centralized task monitoring; loss of transaction history and audit trails. | Digitized operational workflows; automated audit logging per transaction in real time. |

#### 1. Q-Code & Quotation
| Current State | Future State |
| :--- | :--- |
| Inability to cross-check price, stock, photos, and interlocks simultaneously, causing high rejections. | Integrated mass search; automated pre-order verification of interlocks and pricing. |
| Manual single-item Q-Code registration with redundant approval loops causing operational bottlenecks. | Batch Q-Code registration; streamlined approval workflows and standardized technical specs. |

#### 2. PO Management
| Current State | Future State |
| :--- | :--- |
| External communication via Mtalk causes message backlogs and untracked transaction records. | System-embedded collaboration with communication logs directly tied to specific PO items. |
| Fragmented tracking across 4 separate channels: Stock Transfer, Internal, Standard, and Urgent PO. | Consolidated 4-stream dashboard providing full lifecycle visibility and SLA tracking. |
| Manual requisition re-entry upon rejection, causing supply chain disruptions and lost orders. | Automated multi-tier escalation routing: Stock Transfer → Internal PO → Standard PO. |

#### 3. Cost & ETA Management
| Current State | Future State |
| :--- | :--- |
| Requestors manually chase LEC for ETA updates; difficult to detect delayed orders. | Centralized ETA logging by LEC; Requestors proactively track progress and identify anomalies early. |
| Opaque warehouse issue tracking (planned, issuing, issued); unmonitored over-budget expenditures. | Item-level warehouse issue tracking; mandatory justification logging for every budget overrun. |

#### 4. EBOM
| Current State | Future State |
| :--- | :--- |
| Fragmented EBOM hierarchy; inability to measure completion rates across mechanisms. | Visual tree hierarchy by line and mechanism; real-time visibility of completion percentages. |
| Lack of automated validation mechanisms, leaving missing essential component groups undetected. | Automated sanity rules enforcing validation; proactively blocks missing component assemblies. |

**Expected Outcome:** End-to-end internal spare part lifecycle visualization, enhanced data integrity, and reduced system loading rate.

---

## PHẦN 2: BÁO CÁO TỔNG HỢP / TRÌNH CHIẾU (EXECUTIVE / SLIDE-READY)

### Tiếng Việt

#### Vấn đề chung
| Hiện trạng | Sau cải tiến |
| :--- | :--- |
| Xung đột khóa file; dữ liệu phân tán | Hệ thống EMS 2.0 tập trung; đa luồng xử lý |
| Đứt gãy luồng thông tin vòng đời phụ tùng | Đồng bộ chuẩn hóa vòng đời phụ tùng nội bộ |
| Tác vụ thủ công; mất dấu vết kiểm toán | Số hóa quy trình tác nghiệp; tự động lưu Audit trail |

#### 1. Q-Code & báo giá
| Hiện trạng | Sau cải tiến |
| :--- | :--- |
| Tra cứu đơn lẻ; thiếu kiểm soát Interlock | Tra cứu hàng loạt (Mass Search); chặn lỗi đơn hàng |
| Đăng ký thủ công từng mã riêng biệt | Đăng ký theo lô; tinh gọn chu trình phê duyệt |

#### 2. Quản lý PO
| Hiện trạng | Sau cải tiến |
| :--- | :--- |
| Kênh chat Mtalk phân tán, trôi lịch sử | Hội thoại tích hợp gắn theo từng PO item |
| Theo dõi rời rạc 4 tuyến mua sắm | Dashboard hợp nhất 4 luồng; kiểm soát SLA/ETA |
| Tái tạo đơn thủ công khi bị từ chối | Tự động leo thang: Chuyển kho → Internal → Standard PO |

#### 3. Quản lý tiến độ & chi phí
| Hiện trạng | Sau cải tiến |
| :--- | :--- |
| Hỏi ETA thủ công qua LEC; khó phát hiện trễ hạn | LEC cập nhật ETA tập trung; Requestor chủ động theo dõi bất thường |
| Thiếu kiểm soát xuất kho và lý do vượt định mức | Quản lý xuất kho theo item; bắt buộc giải trình vượt ngân sách |

#### 4. EBOM
| Hiện trạng | Sau cải tiến |
| :--- | :--- |
| Cấu trúc phức tạp; mất dấu tiến độ cơ cấu | Cây cấu trúc trực quan; đo lường % hoàn thiện |
| Thiếu kiểm định; lọt lỗi thiếu linh kiện | Quy tắc Sanity rules; tự động chặn thiếu linh kiện |

**Kết quả mong đợi:** Trực quan hóa vòng đời phụ tùng nội bộ, nâng cao tính toàn vẹn số liệu, giảm loading rate.

---

### English Version (Executive / Slide-Ready)

#### General Issues
| Current State | Future State |
| :--- | :--- |
| File-lock conflicts; fragmented legacy tools | Centralized EMS 2.0 platform; multi-threaded concurrency |
| Disconnected data across part lifecycles | Standardized internal spare part lifecycle synchronization |
| Manual workflows; untraceable audit logs | Digitized operational tracking; automated audit trails |

#### 1. Q-Code & Quotation
| Current State | Future State |
| :--- | :--- |
| Isolated lookup; missing interlock checks | Integrated mass search; pre-order error prevention |
| Single-item manual code creation | Batch registration; streamlined approval loops |

#### 2. PO Management
| Current State | Future State |
| :--- | :--- |
| Scattered Mtalk chats; unrecorded history | In-system collaboration tagged per PO item |
| Disjointed tracking of 4 PO streams | Unified 4-stream dashboard; proactive SLA/ETA tracking |
| Manual requisition rework upon rejection | Automated escalation: Transfer → Internal → Standard PO |

#### 3. Cost & ETA Management
| Current State | Future State |
| :--- | :--- |
| Manual ETA inquiries via LEC; untracked delays | Centralized ETA logged by LEC; proactive anomaly tracking by Requestor |
| Opaque issue status; untracked over-budget | Item-level issue tracking; mandatory overrun justification |

#### 4. EBOM
| Current State | Future State |
| :--- | :--- |
| Opaque hierarchy; untracked progress | Visual line/mechanism tree; real-time completion tracking |
| Unvalidated data; missing component risks | Automated sanity rules; blocks incomplete assemblies |

**Expected Outcome:** End-to-end internal spare part lifecycle visualization, enhanced data integrity, and reduced loading rate.
