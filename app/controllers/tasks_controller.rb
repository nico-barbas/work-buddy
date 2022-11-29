class TasksController < ApplicationController
  def create
    #  create a task with a title / description / status
    @task = Task.new(task_params)
    @task.user = current_user
    if @task.save
      flash[:notice] = "Task created successfully"
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
    params.require("task").permit(:title, :description)
  end
end
