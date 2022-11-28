class AddDefaultValuesInTimers < ActiveRecord::Migration[7.0]
  def change
    change_column :timers, :total_time, :integer, default: 0
  end
end
