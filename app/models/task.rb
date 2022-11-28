class Task < ApplicationRecord
  TASK_STATUS = ["to do", "in progress", "done"]
  belongs_to :user
  validates :title, presence: true, length: { minimum: 2, maximum: 140 }
  validates :description, length: { maximum: 300 }
  validates :status, presence: true, inclusion: { in: TASK_STATUS }
end
