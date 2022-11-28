class AddDefaultValuesInLabels < ActiveRecord::Migration[7.0]
  def change
    change_column :labels, :total_label_time, :integer, default: 0
    change_column :labels, :daily_label_time, :integer, default: 0
  end
end
