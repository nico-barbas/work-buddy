class TimersController < ApplicationController

  def create
    # When you start the timer and a timer does not exist (check to be done in html page --- I did it but issue with the create route he cannot find)
    # --> create a new timer with a specific label
    @timer = Timer.new
    @timer.started_at = Time.now
    @timer.user = current_user
    @timer.label = Label.first # Here we will need to obtain the label selected by the user ...
    @timer.save!
    # respond_to do |format|
    #   format.html { redirect_to user_path(current_user) }
    #   format.text { render partial: "users/timer_panel_buttons", locals: { timer: @timer }, formats: [:html] }
    # end
  end

  def pause_timer
    # when you "pause" the timer:
    # pause the timer on the show page
    # save the total_time to the db (before the total_time is incread each second but not saved before you pause)
    @timer = Timer.find(params[:id])
    @timer.update(timer_params)
    # COMMENT POUSSER LE TOTAL_TIME MIS À JOUR POUR POUVOIR L'UTILISER DANS LE HTML?
    # respond_to do |format|
    #   format.html { redirect_to user_path(current_user) }
    #   format.text { render partial: "users/timer_panel_buttons", locals: { timer: @timer }, formats: [:html] }
    # end
  end

  def start_timer
    # When you start the timer and a timer already exist (check to be done in html page)
    # update the start_at (timestamp) to now + restart the timer on the show page (total_time start increasing again)
    @timer = Timer.find(params[:id])
    @timer.started_at = Time.now 
  end


  def close_timer
    # when you "finish" the timer:
    # put the timer on the show page back to 00:00
    # update the total_time
    # push the total time to daily_lable_time / total_label_time
    # mark the timer as logged true
    # display a message telling "Your time has been loged! You can start a new timer"
  end

  private

def timer_params
  params.require(:timer).permit(:total_time, :started_at)
end
end
