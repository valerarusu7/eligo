import { ITask, ITaskObject } from "../../types";

import EmailTask from "./EmailTask/EmailTask";
import MultipleTask from "./MultipleTask/MultipleTask";
import QuestionTask from "./QuestionTask/QuestionTask";

function Task({ task }: ITaskObject) {
  function returnTask() {
    switch (task.taskType) {
      case "email":
        return <EmailTask task={task} />;
      case "multiple":
        return <MultipleTask task={task} />;
      case "single":
        return <QuestionTask />;
      default:
        break;
    }
  }

  return <div>{returnTask()} </div>;
}

export default Task;
