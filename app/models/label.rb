class Label < ApplicationRecord
  has_many :timers
  validates :name, presence: true, length: { minimum: 2 }
end
