class UsersController < ApplicationController

  def show
    if User.find(params[:id]) == current_user
      @task = Task.new
      @tasks = Task.where(user: current_user)
      @timers = Timer.where(user: current_user)
      if @timers.empty?
        @timer = Timer.new({ user: current_user, label: Label.last })
        @timer.save
      else
        @timer = Timer.where(user: current_user).last
      end
      @label = Label.new
      @labels = Label.where(user: current_user)
    else
      redirect_to root_path
    end
  end

  def get_daily_times
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
      format.json { render json: {daily_hours: @hours, daily_minutes: @minutes, labels: @labels}}
    end
  end

  def front_end_test
    @task = Task.new
    @tasks = Task.all
    @timers = Timer.all
  end

  def game
  end
end
