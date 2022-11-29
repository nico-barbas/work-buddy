class UsersController < ApplicationController

  def show
    @task = Task.new
    @tasks = Task.all
  end

  def game
  end
end
