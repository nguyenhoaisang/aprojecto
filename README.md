# AProjectO – Project Management System (React)

## Cách chạy
1. `npm install`
2. Terminal 1: `npm run api`  (json-server chạy ở http://localhost:3001)
3. Terminal 2: `npm run dev`  (website chạy ở http://localhost:5173)

## Tài khoản thử (mật khẩu 123456)
- Leader: leader@aprojecto.com
- Staff:  staff@aprojecto.com  (Yash Ghori)

## Các trang
Chung: Login, Register, Dashboard, Tasks (List + Kanban), Work Logs, Performance, Profile, Settings
Leader: Overview, Projects (list/create/edit), Project detail + Assign Task, SubTasks + Create SubTask, Add User
Staff: Projects (chỉ dự án mình tham gia), Project detail + Checklist, popup Task

## Cấu trúc thư mục (src/)
- api/ : cấu hình axios      - context/ : AuthContext (đăng nhập, phân quyền)
- components/ : Layout, TaskRow, TaskModal, ProjectCard, ProjectForm, PeoplePicker, Pagination, Charts
- pages/ : mỗi trang một thư mục (có file .jsx và .css riêng)
- utils/ : hàm tiện ích về ngày tháng, chọn/bỏ chọn id
