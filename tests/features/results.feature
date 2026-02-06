Feature: Results Visualization
  As a user of the Test Maturity Assessment Tool
  I want to view assessment results visually
  So that I can understand testing maturity levels

  Background:
    Given I am on the Test Maturity Assessment homepage
    And I have a completed assessment named "Sample Assessment"

  Scenario: View radar chart
    When I navigate to the "Results" tab
    And I select "Sample Assessment" from the results dropdown
    Then I should see a radar chart with 6 themes
    And each theme should have a score displayed

  Scenario: View detailed theme breakdown
    When I navigate to the "Results" tab
    And I select "Sample Assessment" from the results dropdown
    Then I should see theme names
    And I should see maturity levels for each theme
    And I should see scores between 1 and 5

  Scenario: Review answer details
    When I navigate to the "Results" tab
    And I select "Sample Assessment" from the results dropdown
    And I scroll to the detailed answers section
    Then I should see all answered questions
    And I should see the answers (Yes/No)
    And I should see comments if provided
