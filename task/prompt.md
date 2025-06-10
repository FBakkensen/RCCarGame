# Claude Code Implementation Prompt - RC Car Racing Game

## Your Mission

You are implementing a web-based RC Car Racing Game following a structured todo list. You must work through each task sequentially, completing one task fully before moving to the next.

## Critical Working Rules

### 1. One Task at a Time
- **ALWAYS** complete the current task before moving to the next
- **NEVER** skip ahead or work on multiple tasks simultaneously
- **FOCUS** exclusively on meeting the Definition of Done for the current task

### 2. Task Completion Protocol

For each task, follow this exact sequence:

```
1. READ the task description and Definition of Done
2. LOCATE referenced documentation sections
3. IMPLEMENT the feature according to specifications
4. TEST that the implementation meets all criteria
5. VERIFY the Definition of Done is satisfied
6. EVALUATE if implementation revealed new requirements
7. UPDATE todo.md if necessary
8. COMMIT the changes
9. MARK the task as complete [x]
10. PROCEED to the next task
```

### 3. Definition of Done Verification

Before marking any task complete, explicitly verify EACH criterion:

```markdown
## Task Completion Checklist for Task #X

Definition of Done states: "[criteria from todo]"

✓ Criterion 1: [Verified/Tested - explain how]
✓ Criterion 2: [Verified/Tested - explain how]
✓ Criterion 3: [Verified/Tested - explain how]

All criteria met: YES/NO
```

### 4. Post-Task Evaluation

After completing each task, ask yourself:

1. **Did this implementation reveal any missing tasks?**
   - If yes: Add them to todo.md in the appropriate section
   - Example: "Discovered need for error boundary around particle system"

2. **Did this affect any future tasks?**
   - If yes: Update their descriptions or definitions of done
   - Example: "Task #23 now needs to handle new input state"

3. **Are there any technical debts or TODOs?**
   - If yes: Document them as comments in code
   - Example: `// TODO: Optimize this when implementing Task #46`

### 5. Git Commit Protocol

After EVERY completed task, make a commit with this format:

```bash
# Commit message format:
Task #[number]: [Task title]

- [Brief description of what was implemented]
- [Key technical decisions made]
- [Any notable challenges resolved]

Meets Definition of Done:
- [Criterion 1]: ✓
- [Criterion 2]: ✓
- [Criterion 3]: ✓
```

Example:
```bash
Task #5: Core Game Loop Implementation

- Implemented fixed timestep game loop with accumulator pattern
- Added pause/resume functionality with state preservation
- Integrated error handling with graceful recovery

Meets Definition of Done:
- Game loop runs at stable 60 FPS: ✓
- Can pause/resume: ✓
- Handles errors gracefully: ✓
```

## Working Example

Here's how you should approach Task #1:

```markdown
## Starting Task #1: Project Structure Setup

### Step 1: Read Task
"Create project directory structure as specified in Implementation Guide Section 2.1"

### Step 2: Check Documentation
- Implementation Guide Section 2.1 specifies:
  - js/, js/entities/, js/systems/, js/ui/, js/data/
  - tests/unit/, tests/integration/
  - index.html with 800x600 canvas
  - main game.js file

### Step 3: Implement
[Create the actual file structure]

### Step 4: Test
- Verify all directories exist
- Verify index.html loads
- Verify canvas displays at 800x600

### Step 5: Verify Definition of Done
✓ All directories exist
✓ index.html loads and displays a canvas
✓ Canvas is 800x600 pixels

### Step 6: Evaluate
- No new requirements discovered
- No updates needed to other tasks

### Step 7: Commit
"Task #1: Project Structure Setup
- Created all required directories
- Set up index.html with 800x600 canvas
- Added basic HTML5 structure"

### Step 8: Mark Complete
- [x] Create project directory structure...
```

## Special Instructions

### When You Encounter Issues

1. **If a task cannot be completed:**
   - Document the blocker as a comment
   - Create a new task for the prerequisite
   - Skip to the next feasible task
   - Return when blocker is resolved

2. **If specifications conflict:**
   - Follow this priority order:
     1. Definition of Done in todo.md
     2. Technical Design Document
     3. Implementation Guide
     4. Other documents

3. **If implementation differs from plan:**
   - Document the deviation in commit message
   - Update relevant documentation sections
   - Ensure Definition of Done is still met

### Code Quality Standards

For every implementation:

1. **Error Handling**
   ```javascript
   try {
       // Risky operation
   } catch (error) {
       console.error('Context:', error);
       // Graceful fallback
   }
   ```

2. **Input Validation**
   ```javascript
   if (!param || typeof param !== 'expected') {
       console.warn('Invalid param:', param);
       return defaultValue;
   }
   ```

3. **Performance Checks**
   ```javascript
   // After each visual task, verify:
   console.log('FPS:', game.performanceMonitor.fps);
   // Must maintain 60 FPS
   ```

### Progress Tracking

Maintain this status in your working memory:

```
Current Task: #[number]
Tasks Completed: [x, y, z]
Known Blockers: [list]
Technical Debts: [list]
Current FPS: [number]
Last Commit: [task number]
```

## Final Reminders

1. **DISCIPLINE**: One task at a time, no exceptions
2. **COMPLETENESS**: Every Definition of Done criterion must be met
3. **EVALUATION**: Always check for new insights after each task
4. **COMMITS**: One commit per completed task
5. **QUALITY**: Error handling, validation, and performance in every task
6. **TESTING**: Verify functionality before marking complete

## Start Implementation

Begin with Task #1 and follow this process exactly. Good luck!

Remember: The goal is a working, polished game. Taking time to complete each task properly is better than rushing through multiple tasks with bugs.