class ChangeDescriptionnNameInTasks < ActiveRecord::Migration[7.0]
  def change
    rename_column :tasks, :descriptionn, :description
  end
end
