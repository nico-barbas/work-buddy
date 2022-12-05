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
    # mark the timer as logged true and set the logged_date
    @timer.logged = true
    @timer.logged_date = Date.today
    @timer.save
    # push the total time to daily_label_time / total_label_time
    label = @timer.label
    label.total_label_time = @timer.total_time
    label.daily_label_time = @timer.total_time
    label.save
  end

  def set_label
    @timer = Timer.find(params[:id])
    @timer.update(timer_params)
    @timer.save
  end

  def get_daily_times
    # A CONNECTER AU STIMULUS CONTROLLER DE MARINE AVEC UNE METHODE DEDIE (Request GET sur la route get_daily_times_path)
    # RENVOYER DE LA DONNEE EN JSON
    # get the total time worked on the given day (based on logged timers) + convert in h / min
    @daily_work_time = 0
    @logged_timers = Timer.where(user: current_user, logged: true, logged_date: Date.today)
    @logged_timers.each do |timer|
        @daily_work_time += timer.total_time
    end
    @hours = @daily_work_time / (1000 * 60 * 60)
    @minutes = @daily_work_time / (1000 * 60) % 60
    @labels = Label.where(user: current_user)
    respond_to do |format|
      format.html { redirect_to user_path(current_user) }
      format.json { render json: {daily_hours: @hours, dayly_minutes: @minutes}}
    end
  end

  private

def timer_params
  params.require(:timer).permit(:total_time, :started_at, :logged, :label_id)
end
end
