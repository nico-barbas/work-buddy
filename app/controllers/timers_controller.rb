class TimersController < ApplicationController

  def create
    # When you start the timer and a timer does not exist (check to be done in html page --- I did it but issue with the create route he cannot find)
    # --> create a new timer with a specific label
    @timer = Timer.new
    @timer.started_at = Time.now
    @timer.user = current_user
    @timer.label = Label.first # Here we will need to obtain the label selected by the user ...To do as a second step
    @timer.save!
    if @timer.save
      # here we ned to start the timer on the show page (the total_time start increasing each second, and is displayed in the timer with JS)
      redirect_to root_path
    end
  end

  def start_timer
    # When you start the timer and a timer already exist (check to be done in html page)
    # update the start_at (timestamp) + restart the timer on the show page (total_time start increasing again)
  end

  def pause_timer
    # when you "pause" the timer:
    # pause the timer on the show page
    # save the total_time to the db (before the total_time is incread each second but not saved before you pause)
  end

  def close_timer
    # when you "finish" the timer:
    # put the timer on the show page back to 00:00
    # update the total_time
    # push the total time to daily_lable_time / total_label_time
    # display a message telling "Your time has been loged! You can start a new timer"
  end
private

# def timer_params
#   params.require(:timer).
# end

end
