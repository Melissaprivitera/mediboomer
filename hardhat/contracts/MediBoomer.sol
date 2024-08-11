//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "./Utils.sol";

contract MediBoomer is Ownable, AutomationCompatibleInterface {
  using Counters for Counters.Counter;

  /// @dev WaysAdministeringMedicines id counter
  Counters.Counter wamId;

  /// @dev Medical Recipe id counter
  Counters.Counter medicalRecipeId;

  /// @dev Intake Time id counter
  Counters.Counter intakeTimeId;

  /// @dev Medicine id counter
  Counters.Counter medicineId;

  /// @dev Prescription id counter
  Counters.Counter prescriptionId;

  /**
   * Public counter variable
   */
  uint256 public counter;

  /**
   * Use an interval in seconds and a timestamp to slow execution of Upkeep
   */
  uint256 public immutable interval;
  uint256 public lastTimeStamp;

  /* Events */
  event WamAdded(address indexed userAddress, string indexed name);
  event IntakeTimeAdded(address indexed userAddress, string indexed time);
  event MedicineAdded(address indexed userAddress, string indexed name);
  event UserAdded(address indexed userAddress, string indexed name);
  event MedicalRecipeAdded(address indexed userAddress);
  event PharmacistsDeliverMedicalRecipe(address indexed pharmacistAddress);
  event TakeMedicineAlarm(
    address indexed userAddress,
    string medicineName,
    string time,
    string dose,
    string wam
  );

  enum UserRole {
    Doctor,
    Pharmacist,
    Patient
  }

  enum MedicalRecipeStatus {
    Created,
    PartialDelivered,
    FullyDelivered
  }

  /// @dev Personal Information of the user
  struct User {
    string id;
    string name;
    string email;
    address contractAddress;
    UserRole userRole;
    uint256 createdAt;
    bool isExists;
  }

  /// @dev Ways of Administering Medicines
  struct WaysAdministeringMedicines {
    uint256 id;
    string name;
  }

  /// @dev Medicine and his way of administering
  struct Medicine {
    uint256 id;
    string name;
    uint256 wamId;
  }

  /// @dev Schedule for taking medication
  struct IntakeTime {
    uint256 id;
    string time;
  }

  /// @dev Each medicine and how to take it
  struct Prescription {
    uint256 id;
    uint256 medicineId;
    string dose;
    bool isDelivered;
    uint256 timeDelivered;
    uint8 duration; // in days
    IntakeTime[] intakeTimeList;
  }

  /// @dev Medical Recipe
  struct MedicalRecipe {
    uint256 id;
    string doctorId;
    string doctorName;
    uint256[] prescriptions; // Array of Prescription Id
    uint256 createdAt;
    MedicalRecipeStatus status;
  }

  WaysAdministeringMedicines[] wamList;
  Medicine[] medicineList;
  IntakeTime[] intakeTimeList;

  /// @dev Only users as patients in this list
  User[] patientList;

  /// @dev map patient with their medical recipes
  mapping(address => uint256[]) mapPatientMedicalRecipes;

  /// @dev map medicalRecipe Id with his medical recipe
  mapping(uint256 => MedicalRecipe) mapMedicalRecipes;

  /// @dev map prescription Id with his prescriotion
  mapping(uint256 => Prescription) mapPrescriptions;

  /// @dev map user with his info
  mapping(address => User) userInfo;

  constructor(uint256 updateInterval) {
    interval = updateInterval;
    lastTimeStamp = block.timestamp;

    counter = 0;
  }

  modifier onlyUser(address userAddress) {
    require(userInfo[userAddress].isExists, "User not registered");
    _;
  }

  function alarmPatient() internal returns (bool) {
    uint256 timestamp = block.timestamp;
    uint256 startDayTimestamp = Utils.timestampFromDate(
      Utils.getYear(timestamp),
      Utils.getMonth(timestamp),
      Utils.getDay(timestamp)
    );
    for (uint256 i = 0; i < patientList.length; i++) {
      uint256[] memory mrIdList = mapPatientMedicalRecipes[
        patientList[i].contractAddress
      ];

      for (uint256 j = 0; j < mrIdList.length; j++) {
        MedicalRecipe memory mr = mapMedicalRecipes[mrIdList[j]];

        uint256[] memory presList = mr.prescriptions;

        for (uint256 k = 0; k < presList.length; k++) {
          Prescription memory presc = mapPrescriptions[presList[k]];
          IntakeTime[] memory ittl = presc.intakeTimeList;

          bool isDelivered = presc.isDelivered;
          for (uint256 m = 0; m < ittl.length; m++) {
            uint256 tsAlarm = Utils.addHours(startDayTimestamp, ittl[m].id);
            string memory medicineName = "";
            string memory wamName = "";
            for (uint256 n = 0; n < medicineList.length; n++) {
              if (medicineList[n].id == presc.medicineId) {
                medicineName = medicineList[n].name;

                for (uint256 p = 0; p < wamList.length; p++) {
                  if (wamList[p].id == medicineList[n].wamId) {
                    wamName = wamList[p].name;
                    break;
                  }
                }
                break;
              }
            }

            if (tsAlarm > timestamp - interval && isDelivered) {
              emit TakeMedicineAlarm(
                patientList[i].contractAddress,
                medicineName,
                ittl[m].time,
                presc.dose,
                wamName
              );
            }
          }
        }
      }
    }

    return false;
  }

  function checkUpkeep(
    bytes memory checkData
  ) public override returns (bool upkeepNeeded, bytes memory performData) {
    alarmPatient();
    bool hasElements = wamList.length == counter;
    bool isTimeExpired = (block.timestamp - lastTimeStamp) > interval;

    upkeepNeeded = hasElements && isTimeExpired;
    // don't used
    performData = checkData;
  }

  function performUpkeep(bytes calldata /* performData */) external override {
    (bool upkeepNeeded, ) = checkUpkeep("");
    require(upkeepNeeded, "No se ha cumplido aun");

    lastTimeStamp = block.timestamp;
    counter = counter + 1;
    // emit TakeMedicineAlarm();
  }

  // TODO: Permisos
  /// @dev Mantainer for WAM
  function addWaysAdministeringMedicines(
    string memory _name,
    address userAddress
  ) public /* onlyOwner */ {
    uint256 id = wamId.current();
    wamList.push(WaysAdministeringMedicines({id: id, name: _name}));
    wamId.increment();

    emit WamAdded(userAddress, _name);
  }

  /// @dev Mantainer for IntakeTime
  function addIntakeTime(
    string memory _time,
    address userAddress
  ) public /* onlyOwner */ {
    uint256 id = intakeTimeId.current();
    intakeTimeList.push(IntakeTime({id: id, time: _time}));
    intakeTimeId.increment();

    emit IntakeTimeAdded(userAddress, _time);
  }

  /// @dev Mantainer for Medicine
  function addMedicine(
    string memory _name,
    uint8 _wamId,
    address userAddress
  ) public /* onlyOwner */ {
    uint256 medId = medicineId.current();
    medicineList.push(Medicine({id: medId, name: _name, wamId: _wamId}));
    medicineId.increment();

    emit MedicineAdded(userAddress, _name);
  }

  function addPrescription(
    uint256 _prescriptionId,
    uint256 _medicineID,
    string memory _dose,
    uint8 _duration,
    IntakeTime[] memory _intakeTimeList
  ) internal {
    Prescription storage prescription = mapPrescriptions[_prescriptionId];
    prescription.id = _prescriptionId;
    prescription.medicineId = _medicineID;
    prescription.dose = _dose;
    prescription.isDelivered = false;
    prescription.duration = _duration;

    for (uint8 i = 0; i < _intakeTimeList.length; i++) {
      prescription.intakeTimeList.push(
        IntakeTime({id: _intakeTimeList[i].id, time: _intakeTimeList[i].time})
      );
    }
  }

  function addMedicalRecipe(
    address _doctorAddress,
    address _patientAddress,
    string memory _doctorId,
    string memory _doctorName,
    Prescription[] calldata _prescriptionList
  ) public {
    uint256 id = medicalRecipeId.current();
    MedicalRecipe storage medicalRecipe = mapMedicalRecipes[id];

    medicalRecipe.id = id;
    medicalRecipe.doctorId = _doctorId;
    medicalRecipe.doctorName = _doctorName;
    medicalRecipe.status = MedicalRecipeStatus.Created;
    medicalRecipe.createdAt = block.timestamp;

    for (uint256 i = 0; i < _prescriptionList.length; i++) {
      uint256 prescId = prescriptionId.current();
      addPrescription(
        prescId,
        _prescriptionList[i].medicineId,
        _prescriptionList[i].dose,
        _prescriptionList[i].duration,
        _prescriptionList[i].intakeTimeList
      );

      medicalRecipe.prescriptions.push(prescId);
      prescriptionId.increment();
    }

    medicalRecipeId.increment();
    mapPatientMedicalRecipes[_patientAddress].push(id);

    emit MedicalRecipeAdded(_doctorAddress);
  }

  function deliverMedicalRecipe(
    address _pharmacistAddress,
    uint256 _medicalRecipeId,
    Prescription[] memory _prescriptions
  ) public {
    MedicalRecipe memory mrList = mapMedicalRecipes[_medicalRecipeId];
    uint256[] memory presList = mrList.prescriptions;
    uint8 deliveredCounter = 0;
    uint8 presDeliveredCounter = 0;
    bool pass = false;

    for (uint256 i = 0; i < presList.length; i++) {
      for (uint256 j = 0; j < _prescriptions.length; j++) {
        if (presList[i] == _prescriptions[j].id) {
          if (
            !mapPrescriptions[_prescriptions[j].id].isDelivered &&
            _prescriptions[j].isDelivered
          ) {
            mapPrescriptions[_prescriptions[j].id].isDelivered = _prescriptions[
              j
            ].isDelivered;

            deliveredCounter++;
            pass = true;
          }

          if (pass || mapPrescriptions[_prescriptions[j].id].isDelivered) {
            presDeliveredCounter++;
            pass = false;
          }
          break;
        }
      }
    }

    if (presDeliveredCounter == _prescriptions.length) {
      mapMedicalRecipes[_medicalRecipeId].status = MedicalRecipeStatus
        .FullyDelivered;
    } else if (
      deliveredCounter > 0 && deliveredCounter <= presDeliveredCounter
    ) {
      mapMedicalRecipes[_medicalRecipeId].status = MedicalRecipeStatus
        .PartialDelivered;
    }

    emit PharmacistsDeliverMedicalRecipe(_pharmacistAddress);
  }

  /// @dev Add a new user to the platform
  function addUser(
    string memory _id,
    string memory _name,
    string memory _email,
    address _contractAddress,
    UserRole _userRole
  ) public {
    require(!userInfo[_contractAddress].isExists, "User already exists");

    userInfo[_contractAddress] = User({
      id: _id,
      name: _name,
      email: _email,
      userRole: _userRole,
      contractAddress: _contractAddress,
      createdAt: block.timestamp,
      isExists: true
    });

    if (_userRole == UserRole.Patient)
      patientList.push(userInfo[_contractAddress]);

    emit UserAdded(_contractAddress, _name);
  }

  /// @dev Get the list of Intake Times
  function getIntakeTimeList() public view returns (IntakeTime[] memory) {
    return intakeTimeList;
  }

  /// @dev Get the list of Ways of Administering Medicines
  function getWamList()
    public
    view
    returns (WaysAdministeringMedicines[] memory)
  {
    return wamList;
  }

  /// @dev Get the list of Medicines
  function getMedicineList() public view returns (Medicine[] memory) {
    return medicineList;
  }

  /// @dev Get a List of Medical Recipes of a Patient
  function getPatientMedicalRecipeList(
    address _address
  ) public view returns (MedicalRecipe[] memory) {
    uint256[] memory mrList = mapPatientMedicalRecipes[_address];
    MedicalRecipe[] memory mr = new MedicalRecipe[](mrList.length);

    for (uint256 i = 0; i < mrList.length; i++) {
      mr[i] = mapMedicalRecipes[mrList[i]];
    }

    return mr;
  }

  /// @dev Get a List of Patients
  function getPatientList() public view returns (User[] memory) {
    return patientList;
  }

  /// @dev Get a Medical Recipes
  function getMedicalRecipe(
    address _address,
    uint256 _medicalRecipeId
  ) public view returns (MedicalRecipe memory) {
    MedicalRecipe[] memory mrList = getPatientMedicalRecipeList(_address);
    uint256 idList = 0;

    for (uint i = 0; i < mrList.length; i++) {
      if (mrList[i].id == _medicalRecipeId) {
        idList = i;
        break;
      }
    }

    return mrList[idList];
  }

  /// @dev Get a Medical Recipes
  function getPrescriptions(
    address _address,
    uint256 _medicalRecipeId
  ) public view returns (Prescription[] memory) {
    MedicalRecipe[] memory mrList = getPatientMedicalRecipeList(_address);
    uint256 idList = 0;

    for (uint i = 0; i < mrList.length; i++) {
      if (mrList[i].id == _medicalRecipeId) {
        idList = i;
        break;
      }
    }

    uint256[] memory prescriptions = mrList[idList].prescriptions;

    Prescription[] memory pl = new Prescription[](prescriptions.length);

    for (uint j = 0; j < prescriptions.length; j++) {
      pl[j] = mapPrescriptions[prescriptions[j]];
    }

    return pl;
  }

  function getUserInfo(address userAddress) public view returns (User memory) {
    return userInfo[userAddress];
  }
}
