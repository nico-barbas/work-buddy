class UsersController < ApplicationController

  def show
    @task = Task.new
    @tasks = Task.all
    @timers = Timer.all
  end

  def front_end_test
    @task = Task.new
    @tasks = Task.all
    @timers = Timer.all
  end

  def game
  end
end
