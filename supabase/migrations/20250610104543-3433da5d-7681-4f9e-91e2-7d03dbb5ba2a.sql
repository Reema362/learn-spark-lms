
-- Insert default email templates for course management
INSERT INTO public.templates (name, type, subject, content, variables, is_active, created_by) VALUES
(
  'Default Course Assignment',
  'email',
  'New Course Assigned: {{course_title}}',
  '<h2>Hello {{user_name}},</h2>
  <p>You have been assigned a new course: <strong>{{course_title}}</strong></p>
  <p><strong>Description:</strong> {{course_description}}</p>
  <p><strong>Due Date:</strong> {{due_date}}</p>
  <p>Please log in to your learning platform to start the course.</p>
  <p><a href="{{course_url}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Course</a></p>
  <p>Best regards,<br>Learning Team</p>',
  '[{"name": "user_name", "description": "Recipient name"}, {"name": "course_title", "description": "Course title"}, {"name": "course_description", "description": "Course description"}, {"name": "due_date", "description": "Course due date"}, {"name": "course_url", "description": "Direct link to course"}]'::jsonb,
  true,
  NULL
),
(
  'Default Course Completion',
  'email',
  'Congratulations! You completed {{course_title}}',
  '<h2>Congratulations {{user_name}}!</h2>
  <p>You have successfully completed the course: <strong>{{course_title}}</strong></p>
  <p><strong>Completion Date:</strong> {{completion_date}}</p>
  <p><strong>Final Score:</strong> {{final_score}}%</p>
  {{#if certificate_available}}
  <p>Your certificate is now available for download.</p>
  <p><a href="{{certificate_url}}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Certificate</a></p>
  {{/if}}
  <p>Keep up the great work!</p>
  <p>Best regards,<br>Learning Team</p>',
  '[{"name": "user_name", "description": "Recipient name"}, {"name": "course_title", "description": "Course title"}, {"name": "completion_date", "description": "Date completed"}, {"name": "final_score", "description": "Final course score"}, {"name": "certificate_available", "description": "Whether certificate is available"}, {"name": "certificate_url", "description": "Certificate download URL"}]'::jsonb,
  true,
  NULL
),
(
  'Default Course Reminder',
  'email',
  'Reminder: Complete {{course_title}} by {{due_date}}',
  '<h2>Hi {{user_name}},</h2>
  <p>This is a friendly reminder that you have an upcoming course deadline.</p>
  <p><strong>Course:</strong> {{course_title}}</p>
  <p><strong>Due Date:</strong> {{due_date}}</p>
  <p><strong>Progress:</strong> {{progress_percentage}}% completed</p>
  <p>{{#if days_remaining}}
  You have {{days_remaining}} days remaining to complete this course.
  {{else}}
  This course is overdue. Please complete it as soon as possible.
  {{/if}}</p>
  <p><a href="{{course_url}}" style="background-color: #ffc107; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Continue Course</a></p>
  <p>Best regards,<br>Learning Team</p>',
  '[{"name": "user_name", "description": "Recipient name"}, {"name": "course_title", "description": "Course title"}, {"name": "due_date", "description": "Course due date"}, {"name": "progress_percentage", "description": "Current progress percentage"}, {"name": "days_remaining", "description": "Days until deadline"}, {"name": "course_url", "description": "Direct link to course"}]'::jsonb,
  true,
  NULL
),
(
  'Default Course Quiz Failure',
  'email',
  'Quiz Attempt Result: {{course_title}}',
  '<h2>Hi {{user_name}},</h2>
  <p>You recently completed a quiz for: <strong>{{course_title}}</strong></p>
  <p><strong>Your Score:</strong> {{quiz_score}}%</p>
  <p><strong>Passing Score:</strong> {{passing_score}}%</p>
  <p>Unfortunately, you did not achieve the passing score for this quiz.</p>
  {{#if attempts_remaining}}
  <p>You have {{attempts_remaining}} attempts remaining. We encourage you to:</p>
  <ul>
    <li>Review the course materials</li>
    <li>Focus on the areas where you struggled</li>
    <li>Retake the quiz when you feel ready</li>
  </ul>
  <p><a href="{{course_url}}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review & Retry</a></p>
  {{else}}
  <p>You have used all available attempts. Please contact your manager or the learning team for assistance.</p>
  {{/if}}
  <p>Best regards,<br>Learning Team</p>',
  '[{"name": "user_name", "description": "Recipient name"}, {"name": "course_title", "description": "Course title"}, {"name": "quiz_score", "description": "Quiz score achieved"}, {"name": "passing_score", "description": "Required passing score"}, {"name": "attempts_remaining", "description": "Number of attempts left"}, {"name": "course_url", "description": "Direct link to course"}]'::jsonb,
  true,
  NULL
),
(
  'Default Manager Reminder',
  'email',
  'Team Member Course Status: {{employee_name}}',
  '<h2>Hi {{manager_name}},</h2>
  <p>This is an update regarding your team member''s course progress.</p>
  <p><strong>Employee:</strong> {{employee_name}}</p>
  <p><strong>Course:</strong> {{course_title}}</p>
  <p><strong>Status:</strong> {{course_status}}</p>
  <p><strong>Progress:</strong> {{progress_percentage}}% completed</p>
  <p><strong>Due Date:</strong> {{due_date}}</p>
  {{#if is_overdue}}
  <p style="color: #dc3545;"><strong>⚠️ This course is overdue.</strong></p>
  {{else}}
  <p><strong>Days Remaining:</strong> {{days_remaining}}</p>
  {{/if}}
  <p>{{#if action_required}}
  Please follow up with {{employee_name}} to ensure course completion.
  {{else}}
  No immediate action required.
  {{/if}}</p>
  <p><a href="{{dashboard_url}}" style="background-color: #6f42c1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Team Dashboard</a></p>
  <p>Best regards,<br>Learning Management System</p>',
  '[{"name": "manager_name", "description": "Manager name"}, {"name": "employee_name", "description": "Employee name"}, {"name": "course_title", "description": "Course title"}, {"name": "course_status", "description": "Current course status"}, {"name": "progress_percentage", "description": "Progress percentage"}, {"name": "due_date", "description": "Course due date"}, {"name": "is_overdue", "description": "Whether course is overdue"}, {"name": "days_remaining", "description": "Days until deadline"}, {"name": "action_required", "description": "Whether manager action is needed"}, {"name": "dashboard_url", "description": "Link to manager dashboard"}]'::jsonb,
  true,
  NULL
),
(
  'Default Course Certification',
  'email',
  'Your Certificate is Ready: {{course_title}}',
  '<h2>Congratulations {{user_name}}!</h2>
  <p>Your certificate for <strong>{{course_title}}</strong> is now ready for download.</p>
  <p><strong>Course Completed:</strong> {{completion_date}}</p>
  <p><strong>Final Score:</strong> {{final_score}}%</p>
  <p><strong>Certificate ID:</strong> {{certificate_id}}</p>
  <p>This certificate validates your successful completion of the course and can be used for professional development records.</p>
  <div style="text-align: center; margin: 20px 0;">
    <a href="{{certificate_download_url}}" style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">📜 Download Certificate</a>
  </div>
  <p><small>You can also access your certificates anytime from your profile dashboard.</small></p>
  <p>Congratulations on your achievement!</p>
  <p>Best regards,<br>Learning Team</p>',
  '[{"name": "user_name", "description": "Recipient name"}, {"name": "course_title", "description": "Course title"}, {"name": "completion_date", "description": "Date completed"}, {"name": "final_score", "description": "Final course score"}, {"name": "certificate_id", "description": "Unique certificate identifier"}, {"name": "certificate_download_url", "description": "Direct download link for certificate"}]'::jsonb,
  true,
  NULL
);
