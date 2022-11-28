class Timer < ApplicationRecord
  belongs_to :label
  belongs_to :user
end
