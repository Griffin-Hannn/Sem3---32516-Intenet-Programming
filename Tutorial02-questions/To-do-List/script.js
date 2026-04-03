function addTask() {
    const input = document.getElementById("taskInput");
    const taskText = input.value.trim(); // Get the task text and trim whitespace

    // Don't add an empty task
    if (taskText === "") {
        /* Your code here... alert the user that they cannot add an empty task */
        alert("You cannot add an empty task!");
        return;
    }

    // Create list item element
    const li = document.createElement("li");
    li.textContent = taskText;

    // Create button container for "Done" and "Delete" (Use a div to group buttons)
    /* Your code here... create a div element and assign it to a variable called actionDiv */
    const actionDiv = document.createElement("div");

    // assign "actions" to be the className of the div
    /* Your code here... set the className of the div to "actions" */
    actionDiv.className = "actions";

    // Create a Done button
    const doneBtn = document.createElement("button");
    doneBtn.textContent = "Done";
    doneBtn.onclick = function () {
        li.classList.toggle("done");
    };

    // Create a Delete button in the same way as the Done button and assign the textContent to "Delete"
    /* Your code here... create a button element and assign it to a variable called delBtn, set the textContent of the button to "Delete" */
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = function () {
        li.remove(); // Removes the task
    };

    // Append the Done button to the container
    actionDiv.appendChild(doneBtn);

    // In the same way, append the Delete button to the container
    /* Your code here... append the delBtn to the actionDiv */
    actionDiv.appendChild(delBtn);
    // Attach the button container (along with the two buttons within it) to the list item
    li.appendChild(actionDiv);

    // Add list item to the top of the task list
    document.getElementById("taskList").prepend(li); // Prepend to put at the top

    // Clear the input box
    input.value = "";
}