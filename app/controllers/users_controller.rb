class UsersController < ApplicationController

  def show
    if User.find(params[:id]) == current_user
      @task = Task.new
      @tasks = Task.where(user: current_user)
      @timers = Timer.where(user: current_user)
      if @timers.empty?
        @timer = Timer.new({user: current_user, label: Label.last})
        # FIXME: Change before push on production
        @timer.save!
      else
        @timer = Timer.where(user: current_user).last
      end
   else
      redirect_to root_path
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
