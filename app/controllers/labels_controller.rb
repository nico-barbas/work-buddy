class LabelsController < ApplicationController

  def create
    # to be able to create a new lable with a label name
    @label = Label.new(label_params)
    @label.user = current_user
    @label.save
    respond_to do |format|
      format.html { redirect_to user_path(current_user) }
      format.text { render partial: "users/assign_label", locals: { labels: Label.where(user: current_user), timer: Timer.where(user: current_user).last}, formats: [:html] }
    end
  end

  def index
    @labels = Label.where(user: current_user)
  end

  def update
    # to be able to change the label name manually
    @label = Label.find(params[:id])
    @label.update(label_params)
    @label.save
  end

  def destroy
    # to be able to destroy a label
    @label = Label.find(params[:id])
    @label.destroy
  end

  private

  def label_params
    params.require(:label).permit(:name)
  end
end
