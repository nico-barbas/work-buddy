class AddLoggedInTimers < ActiveRecord::Migration[7.0]
  def change
    add_column :timers, :logged, :boolean, default: false
  end
end
