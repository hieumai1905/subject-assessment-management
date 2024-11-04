insert into public.assignment (active, created_by, created_date, updated_by, updated_date, assignment_title, display_order, eval_weight, expected_loc, note, type_evaluator, subject_id)
values  (true, null, '2024-07-21 23:01:00.341000', null, '2024-07-21 23:01:00.341000', 'Assessment 1', 1, 15, 100, 'Evaluating items:
- Source Codes & Demo DB: weight 10%
- Requirement & Design Document (RDS Document): weight 20%,
- Product (LOC based, based on the complexity & quality of the newly-created screens/functions): weight 70%', 'TEACHER_IN_CLASS', 1),
        (true, null, '2024-07-21 23:01:00.343000', null, '2024-07-21 23:01:00.343000', 'Assessment 2', 2, 20, 100, 'Evaluating items:
- Source Codes & Demo DB: weight 10%
- Requirement & Design Document (RDS Document): weight 20%,
- Product (LOC based, based on the complexity & quality of the newly-created screens/functions): weight 70%', 'TEACHER_IN_CLASS', 1),
        (true, null, '2024-07-21 23:01:00.344000', null, '2024-07-21 23:01:00.344000', 'Assessment 3', 3, 25, 100, 'Evaluating items:
- Source Codes & Demo DB: weight 15%
- Requirement & Design Document (RDS Document): weight 25%,
- Product (LOC based, based on the complexity & quality of all the completed screens/functions): weight 60%', 'TEACHER_IN_CLASS', 1),
        (true, null, '2024-07-21 23:01:00.344000', null, '2024-07-21 23:01:00.344000', 'Final Project Presentation', 4, 40, 150, 'The exam is organized by exam board. Must have at least 2 teachers for grading Final Project Presentation. Each team have 45 minutes for presentation.
Evaluate the final presentation, based on what the teams introduce, share, and demonstrate their final software product, mainly focus on:
- Software product/implementation: 40%
- Requirement analyzing: 20%
- Software designing: 20%
- Team working: 20%', 'FINAL_EVALUATOR', 1);