class Label < ApplicationRecord
  has_many :timers
  belongs_to :user
  validates :name, presence: true, length: { minimum: 2 }
  validates :user, presence: true
end
