Feature: Data Management
  As a user of the Test Maturity Assessment Tool
  I want to export and import assessment data
  So that I can backup and share assessments

  Background:
    Given I am on the Test Maturity Assessment homepage

  Scenario: Export assessments
    Given I have at least one saved assessment
    When I navigate to the "Data" tab
    And I click export all data button
    Then a JSON file should be downloaded
    And the file should contain all assessments

  Scenario: Import assessments
    Given I have an exported assessments file
    When I navigate to the "Data" tab
    And I upload the assessments file
    And I click import button
    Then I should see a success message
    And the imported assessments should appear in the list

  Scenario: Delete an assessment
    Given I have a saved assessment named "Old Assessment"
    When I navigate to the "Data" tab
    And I click delete for "Old Assessment"
    And I confirm the deletion
    Then "Old Assessment" should no longer appear in the list
