class CreateLabels < ActiveRecord::Migration[7.0]
  def change
    create_table :labels do |t|
      t.string :name
      t.integer :total_label_time
      t.integer :daily_label_time
      t.timestamps
    end
  end
end
