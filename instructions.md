# AI Coding Guidelines

## General Instructions

When receiving tasks, the AI agent should:
- Generate **clean, simple, and maintainable code** while keeping flexibility in mind for rapid iteration.
- Use **clear, meaningful names** for functions, variables, and classes, but avoid over-complicating the structure.
- Focus on delivering **working solutions** for the current iteration, without worrying too much about perfection or long-term stability—features and logic may change frequently.
- After completing a task, **update the `design.doc` file** with any significant changes to the code, new components, or important design decisions. The `design.doc` should reflect the current state of the app, including any evolving requirements or architectural changes.
- Keep the **code modular and flexible**, as parts of the app will likely change during this iterative process.
- **Avoid unnecessary complexity**—implement what is needed for the current version, and be ready to refactor later as the app stabilizes.

---

## Task Breakdown

Each task will typically have the following components:
- **Goal/Description**: A brief explanation of the task or feature to be implemented.
- **Input**: The data structure, type, or requirements for input (if applicable).
- **Output**: The expected output, including data format or result.
- **Dependencies**: Libraries, services, or tools that are needed.
- **Example**: Provide an example for edge cases, standard use cases, or expected input/output.

---

## Common Coding Tasks

### 1. **Function Implementation**
- **Goal**: Implement a function to perform a specific task.
- **Instructions**:
  - Keep the implementation simple, clear, and flexible.
  - Use descriptive names for functions and variables, but focus on **getting the functionality right** rather than optimizing or refining too early.
  - Handle basic cases and leave room for future improvements.
  - Example (Python):
    ```python
    def calculate_total(cart):
        total = 0
        for item in cart:
            total += item['quantity'] * item['price']
        return total
    ```
  - Example (JavaScript):
    ```javascript
    function calculateTotal(cart) {
        let total = 0;
        cart.forEach(item => {
            total += item.quantity * item.price;
        });
        return total;
    }
    ```

### 2. **Code Refactoring**
- **Goal**: Refactor code to improve clarity, readability, and simplicity.
- **Instructions**:
  - Make small changes to improve the structure or simplify the logic.
  - Avoid **major changes** to functionality at this stage—focus on improving existing code without breaking it.
  - Keep code **easy to change** and **reusable** as features evolve.
  - **Document refactorings** in the `design.doc` to reflect what changed and why.

### 3. **Basic Feature Implementation**
- **Goal**: Implement a new feature or functionality.
- **Instructions**:
  - Focus on **rapidly delivering a working feature** that meets the basic requirements.
  - The feature doesn’t need to be perfect or final—it should just be functional for the current iteration.
  - Ensure **basic usability** and **logical consistency**, but feel free to leave parts of the feature open to future improvements.
  - Example: Implementing a simple **shopping cart** feature might involve setting up the core logic without worrying about advanced UI elements or perfect optimization.

### 4. **Bug Fixing**
- **Goal**: Identify and resolve bugs in the code.
- **Instructions**:
  - Focus on **quick fixes** for issues that prevent the app from working as expected.
  - When encountering bugs, implement a **simple solution** to address the issue and keep things moving forward.
  - **Document** the bug and the fix in the `design.doc` so it’s clear what was changed and why.
  - Avoid **over-engineering** the fix—solve the problem and move on.

---

## Code Quality Requirements

- **Simplicity**: Keep the code **simple** and **modular**, focusing on delivering functional code. Avoid overcomplicating features at this stage.
- **Documentation**: Document key decisions, logic, or design changes in the `design.doc`. The documentation should reflect the current state of the app, highlighting any evolving requirements or major changes.
- **Variable Naming**: Use **clear and descriptive names** for functions, variables, and classes, but don’t obsess over minor details at this stage. Keep it understandable and flexible.
- **Comments**: Use comments to explain **complex logic** or any assumptions you’ve made during the implementation. Avoid excessive comments for self-explanatory code.
- **Modularity**: Break the code into small, independent pieces (e.g., functions or components). This will make it easier to update or change parts of the app without affecting the entire system.

---

## Example Task

### **Task**: Implement a basic function to calculate the total price of items in a shopping cart.

#### **Goal**:
- Calculate the total price by summing the price of each item, accounting for quantity.

#### **Input**:
- A list of items, each with `name`, `quantity`, and `price`.

#### **Output**:
- A number representing the total price.

#### **Dependencies**:
- None required at this stage.

#### **Example**:
- Example in **Python**:
    ```python
    def calculate_total(cart):
        total = 0
        for item in cart:
            total += item['quantity'] * item['price']
        return total
    ```

- Example in **JavaScript**:
    ```javascript
    function calculateTotal(cart) {
        let total = 0;
        cart.forEach(item => {
            total += item.quantity * item.price;
        });
        return total;
    }
    ```

---

## Design Doc Updates

After completing each task, the AI agent must update the `design.doc` file with the following:

- **Summary of Changes**: A brief summary of the feature or bug fix, highlighting the key changes made.
- **Code Changes**: Specific parts of the code that were added, updated, or removed. If applicable, provide a rationale for the changes.
- **Known Limitations**: Any known issues, missing features, or things that are still in development.
- **Next Steps**: Suggested future work or areas that still need improvement.

---

## Task Templates

For common tasks, you can use a **template** to streamline the process:
- **Template for Functions**:
  - Name
  - Purpose
  - Arguments and return types
  - Edge cases
- **Template for Updates**:
  - Name of the feature or bug fix
  - Key changes made
  - Current limitations or known issues
  - Next steps

Example:
```python
def [function_name]([arguments]) -> [return_type]:
    """
    Purpose:
    [Brief description]
    
    Args:
    [arguments]

    Returns:
    [return_type]
    """
    # Function implementation