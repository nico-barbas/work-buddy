class TimersController < ApplicationController

  def create
    # When you start the timer and a timer does not exist (check to be done in html page --- I did it but issue with the create route he cannot find)
    # --> create a new timer with a specific label
    @timer = Timer.new
    @timer.started_at = Time.now
    @timer.user = current_user
    if Label.find_by name: "no label assigned"
      label = Label.find_by name: "no label assigned"
      @timer.label = label
    else
      @timer.label = Label.create(name: "no label assigned", user: current_user) # Here we will need to obtain the label selected by the user ...
    end
    @timer.save
  end

  def pause_timer
    # when you "pause" the timer:
    # pause the timer on the show page
    # save the total_time to the db (before the total_time is incread each second but not saved before you pause)
    @timer = Timer.find(params[:id])
    @timer.update(timer_params)
    @timer.save
  end

  def close_timer
    # when you "finish" the timer:
    # put the timer on the show page back to 00:00 (--> stimulus controller does it)
    # update the total_time
    @timer = Timer.find(params[:id])
    @timer.update(timer_params)
    # mark the timer as logged true
    @timer.logged = true
    @timer.save
    # push the total time to daily_lable_time / total_label_time -- TO DO
    # display a message telling "Your time has been loged! You can start a new timer" -- TO DO
  end

  def set_label
    @timer = Timer.find(params[:id])
    @timer.update(timer_params)
    @timer.save
  end

  private

def timer_params
  params.require(:timer).permit(:total_time, :started_at, :logged, :label_id)
end
end
