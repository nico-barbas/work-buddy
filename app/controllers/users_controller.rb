class UsersController < ApplicationController

  def show
    if User.find(params[:id]) == current_user
    @task = Task.new
    @tasks = Task.where(user: current_user)
    @timers = Timer.where(user: current_user)
    @timer = Timer.where(user: current_user, logged: false).last
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
