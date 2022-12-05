class Label < ApplicationRecord
  has_many :timers, dependent: :destroy
  belongs_to :user
  validates :name, presence: true, length: { minimum: 2 }, uniqueness: { scope: :user}
  validates :user, presence: true
end
