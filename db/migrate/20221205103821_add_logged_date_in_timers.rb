class AddLoggedDateInTimers < ActiveRecord::Migration[7.0]
  def change
    add_column :timers, :logged_date, :date, default: nil
  end
end
