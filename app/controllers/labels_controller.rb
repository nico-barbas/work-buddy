class LabelsController < ApplicationController

  def create
    # to be able to create a new lable with a label name
    @label = Label.new(label_params)
    if @label.save
      flash[:notice] = "Label created successfully"
    end
    # respond_to do |format|
    #   format.html { redirect_to user_path(current_user) }
    #   # format.text { render partial: "users/task_list", locals: { tasks: Task.where(user:current_user) }, formats: [:html] }
    # end
  end

  def update
    # to be able to change the label name manually (--> private method update_name)
  end

  def update_time
    # route to create
    # to be automatically update both the daily_lable_time and the total_lable_time each time we finish a timer (--> private method update_time)
  end

  def clean_daily_label_time
    # route to create
    # each day at midnight, put the daily_label_time back to 0
  end

  private

  def label_params
    params.require(:label).permit(:name, :description)
  end
end
