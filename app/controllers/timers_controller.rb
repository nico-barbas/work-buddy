class TimersController < ApplicationController

  def create
    # When you start the timer and a timer does not exist (check to be done in html page --- I did it but issue with the create route he cannot find)
    # --> create a new timer with a specific label
    @timer = Timer.new
    @timer.started_at = Time.now
    @timer.user = current_user
    @timer.label = Label.first # Here we will need to obtain the label selected by the user ...
    @timer.save!
  end

  def pause_timer
    # when you "pause" the timer:
    # pause the timer on the show page
    # save the total_time to the db (before the total_time is incread each second but not saved before you pause)
    @timer = Timer.find(params[:id])
    @timer.total_time 
    # il faut que je récupère les heures / minutes / secondes et que je créé le total_time avec cela
    # a priori il faut que je fasse des values avec heures / minutes / secondes pour pouvoir les utiliser en params ici
  end

  def start_timer
    # When you start the timer and a timer already exist (check to be done in html page)
    # update the start_at (timestamp) + restart the timer on the show page (total_time start increasing again)
  end


  def close_timer
    # when you "finish" the timer:
    # put the timer on the show page back to 00:00
    # update the total_time
    # push the total time to daily_lable_time / total_label_time
    # mark the timer as logged true
    # display a message telling "Your time has been loged! You can start a new timer"
  end
end
