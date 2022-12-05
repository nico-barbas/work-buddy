class AddUserToLabels < ActiveRecord::Migration[7.0]
  def change
    add_reference :labels, :user, null: false, foreign_key: true
  end
end
