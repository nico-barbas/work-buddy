class TasksController < ApplicationController
  def create
    #  create a task with a title / description / status
    task = Task.new(title:, description:)
    if task.save
      flash[:notice] = "Task created successfully"
      redirect_to tasks_path
    end
  end

  def update
    #  update title / description / status of a given task
  end

  def destroy
    # delete a given task
  end

  private

  def task_params
    params.require("task").permit(:title, :descriptionn)
  end
end
