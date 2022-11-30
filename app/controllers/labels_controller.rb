class LabelsController < ApplicationController

  def create
    # to be able to create a new lable with a label name
  end

  def update
    # to be able to change the label name manually (--> private method update_name)
  end

  def update_time
    # route to create
    # to be automatically update both the daily_lable_time and the total_lable_time each time we finish a timer (--> private method update_time)
  end

  def clean_daily_label_time
    # route to create
    # each day at midnight, put the daily_label_time back to 0
  end

  private

  def label_params
  end

end
