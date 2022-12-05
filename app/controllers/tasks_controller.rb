class TasksController < ApplicationController
  def create
    #  create a task with a title / description / status
    @task = Task.new(task_params)
    @task.user = current_user
    if @task.save
      flash[:notice] = "Task created successfully"
    end
    respond_to do |format|
      format.html { redirect_to user_path(current_user) }
      format.text { render partial: "users/task_list", locals: { tasks: Task.where(user:current_user) }, formats: [:html] }
    end
  end

  def update
    #  update title / description / status of a given task
    @task = Task.find(params[:id])
    p params[:task]
    if params[:task].nil?
      case @task.status
      when "done" then @task.status = "to do"
      when "to do" then @task.status = "done"
      end
      @task.save
      respond_to do |format|
        format.html { redirect_to user_path(current_user) }
        format.text { render partial: "users/card_task", locals: { task: @task }, formats: [:html] }
      end
    else
      @task.update(task_params)
        respond_to do |format|
          format.html { redirect_to user_path(current_user) }
          format.text { render partial: "users/card_task", locals: { task: @task }, formats: [:html] }
        end
    end
  end

  def destroy
    # delete a given task
    @task = Task.find(params[:id])
    @task.destroy
    respond_to do |format|
      format.html { redirect_to user_path(current_user) }
      format.text { render partial: "users/task_list", locals: { tasks: Task.where(user:current_user) }, formats: [:html] }
    end
  end

  private

  def task_params
    params.require(:task).permit(:title, :description)
  end
end
