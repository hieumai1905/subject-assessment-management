-- Start Insert to Subject
insert into public.subjects (is_council, active, created_by, created_date, updated_by, updated_date, description, subject_code, subject_name)
values  (true, true, null, '2024-05-09 10:10:05.000000', null, '2024-05-09 10:10:05.000000', 'Đồ án mini', 'DAN111', 'Đồ án mini');
-- End Insert to Subject

-- Start Insert Subject Setting
insert into public.setting (active, created_by, created_date, updated_by, updated_date, description, display_order, ext_value, name, setting_type, subject_id)
values
(true, null, '2024-08-18 02:08:30.535000', null, '2024-08-18 02:08:30.535000', '', 1, '50', 'Thấp', 'Quality', 1),
(true, null, '2024-08-18 02:08:53.325000', null, '2024-08-18 02:08:53.325000', '', 2, '75', 'Trung bình', 'Quality', 1),
(true, null, '2024-08-18 02:09:07.846000', null, '2024-08-18 02:09:07.846000', '', 3, '100', 'Cao', 'Quality', 1),
(true, null, '2024-08-18 02:10:01.730000', null, '2024-08-18 02:10:01.730000', '', 1, '60', 'Đơn giản', 'Complexity', 1),
(true, null, '2024-08-18 02:10:20.281000', null, '2024-08-18 02:10:20.281000', '', 2, '120', 'Trung bình', 'Complexity', 1),
(true, null, '2024-08-18 02:10:38.232000', null, '2024-08-18 02:10:38.232000', '', 3, '240', 'Phức tạp', 'Complexity', 1),
(true, null, '2024-08-18 02:12:24.118000', null, '2024-08-18 02:12:24.118000', '', 1, '10', 'Lần 1', 'Round', 1);
-- End Insert to Subject Setting