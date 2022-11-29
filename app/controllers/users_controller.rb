class UsersController < ApplicationController

  def show
    @task = Task.new
    @tasks = Task.all
    @timer = Timer.new
    @timers = Timer.all
  end

  def game
  end
end
