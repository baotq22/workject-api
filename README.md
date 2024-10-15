# WorkJect Backend

WorkJect is a simple task management web app that allows our team managers and their team members to create and manage their tasks. The app is designed to help individuals and teams stay organized and on track with their daily tasks and projects.

The manager create an account for member, then member go to mail inbox to receive account.

User should change password after login, and they can change name, title, roles.

Manager create task (field title, priority, status, upload assets, select date) then assign member, update task, add sub-task and cancel task

User can comment an activity, view details task, receive an notification inside application and via email

User can view profile

Manager can manage another user, change status, or delete

## User stories

### Manager

- [ ] As a manager, I want to be able to invite new team members to set up their account
- [ ] As a manager, I want to be able to create and assign tasks to specific team members
- [ ] As a manager, I want to be able to provide description, set priorities, and deadlines for each task.
- [ ] As a manager, I want to be able to create projects that group related tasks together
- [ ] As a manager, I want to be able to view my team's tasks by assignee, by status, by project, and by priority.
- [ ] As a manager, I want to be able to monitor task progress, and update tasks as needed.
- [ ] As a manager, I want to be able to receive notification and reminders related to the tasks I created

### Team Member

- [ ] As a team member, I want to be able set up my account through invitation
- [ ] As a team member, I want to be able to log in/out of my account
- [ ] As a team member, I want to be able to view my assigned tasks, deadlines, and priorities in one place.
- [ ] As a team member, I want to be able to receive notification and reminders related to my tasks
- [ ] As a team member, I want to be able to update the status of my tasks, mark them as complete, and provide comments or notes as necessary.
- [ ] As a team member, I want to be able to collaborate with my team members by sharing files or resources related to the tasks.

## Endpoint APIs

### User API

```javascript
/**
 * @route POST:/user/login
 * @description Log in with email and password
 * @body { email, password }
 * @access Public
 */
```

```javascript
/**
 * @route POST:/user/logout
 * @description Log OUT
 * @access Required login
 */
```

```javascript
/**
 * @route GET:/user/get-team
 * @description Get all member in team list
 * @access Required login
 */
```

```javascript
/**
 * @route GET:/user/notifications
 * @description Get notifications
 * @access Required login
 */
```

```javascript
/**
 * @route PUT:/user/profile
 * @description Update Profile
 * @body { name, title, role }
 * @access Required login
 */
```

```javascript
/**
 * @route PUT:/user/read-noti
 * @description Mark as read a notification
 * @body { id }
 * @access Required login
 */
```

```javascript
/**
 * @route PUT:/user/change-password
 * @description Change password
 * @body { password }
 * @access Required login
 */
```

```javascript
/**
 * @route POST:/user/:id
 * @description Change status account
 * @body { id }
 * @access Required login
 */
```

```javascript
/**
 * @route POST:/user/:id
 * @description Delete account
 * @body { id }
 * @access Required login
 */
```

### Task API

```javascript
/**
 * @route POST /task/create
 * @description Create task
 * @body { title, team, description, stage, date, priority, assets }
 * @access Required login
 */
```

```javascript
/**
 * @route POST /task/duplicate/:id
 * @description Duplicate task
 * @body { id, title, team, description, stage, date, priority, assets }
 * @access Required login
 */
```

```javascript
/**
 * @route POST /task/activity/:id
 * @description Create activity and comment for task
 * @body { id, task, activity }
 * @access Required login
 */
```

```javascript
/**
 * @route GET /task/dashboard
 * @description Dashboard
 * @access Required login
 */
```

```javascript
/**
 * @route GET /task
 * @description Get all task
 * @access Required login
 */
```

```javascript
/**
 * @route GET /task/:id
 * @description Get single task
 * @body { id }
 * @access Required login
 */
```

```javascript
/**
 * @route PUT /task/create-subtask/:id
 * @description Create sub-task
 * @body { id }
 * @access Required login
 */
```

```javascript
/**
 * @route PUT /task/update/:id
 * @description Update task
 * @body { id }
 * @access Required login
 */
```

```javascript
/**
 * @route PUT /task/:id
 * @description Cancel task
 * @body { id }
 * @access Required login
 */
```

```javascript
/**
 * @route POST /task/delete-restore/:id
 * @description Delete or restore task
 * @body { id }
 * @access Required login
 */
```

## References
- Template for reference: (https://www.figma.com/community/file/1245674654540637066)
- Library used: bcryptjs, body-parser, cookie-parser, cors, dotenv, express, express-validator, jsonwebtoken, mongodb, mongoose, morgan, node-cron, nodemailer, nodemon
- Database: MongoDB
- ERD: 

![img](erd.png)
