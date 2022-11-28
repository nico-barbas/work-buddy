class AddDefaultValueToStatus < ActiveRecord::Migration[7.0]
  def change
    change_column :tasks, :status, :string, default: "to do"
  end
end
