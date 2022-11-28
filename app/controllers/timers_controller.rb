class TimersController < ApplicationController
  def create
    # create a new timer with a specific label
  end

  def update
    # when starting for the first time or re-starting the timer --> update the start_at (timestamp) (cf private method update_start)
    # when you "pause" the timer --> update the total_time (cf private method update_total_time)
    # when you "finish" the timer --> update the total_time + push the total time to daily_lable_time / total_lable_time (cf private push_time)
  end

  private

  def update_start
  end

  def update_total_time
  end

  def push_time
    # push the total_time to the update_time method of label
  end
end
