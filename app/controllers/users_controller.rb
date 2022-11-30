class UsersController < ApplicationController

  def show
    @task = Task.new
    @tasks = Task.all
    @timers = Timer.all
    # how to find the timer when it is already existing? 
  end

  def game
  end
end
