Feature: Interview Management
  As a user of the Test Maturity Assessment Tool
  I want to conduct interviews and answer questions
  So that I can assess testing maturity

  Background:
    Given I am on the Test Maturity Assessment homepage

  Scenario: Start a new interview without folder sync
    When I navigate to the "Interview" tab
    And I enter "Test Application" as the application name
    And I enter "QA Team" as the interview name
    And I select "All profiles" profile
    And I click "Start Interview"
    Then I should see the interview questions
    And I should see a progress bar

  Scenario: Answer interview questions
    Given I have started an interview with name "Test App"
    When I answer "Yes" to the first question
    And I add a comment "This is working well" to the first question
    Then the progress bar should show progress
    And the question should be marked as answered

  Scenario: Save interview results
    Given I have started an interview with name "Test App"
    And I have answered at least 5 questions
    When I click save interview button
    Then I should see a success message
    And the interview should appear in the results list

  Scenario: View saved interview results
    Given I have a saved interview named "Test App"
    When I navigate to the "Results" tab
    And I select "Test App" from the results dropdown
    Then I should see the maturity radar chart
    And I should see theme scores
    And I should see detailed answers
