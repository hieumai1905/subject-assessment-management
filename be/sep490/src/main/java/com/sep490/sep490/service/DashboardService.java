package com.sep490.sep490.service;

import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.dto.dashboard.*;
import com.sep490.sep490.entity.Classes;
import com.sep490.sep490.entity.Setting;
import com.sep490.sep490.entity.Subject;
import com.sep490.sep490.entity.User;
import com.sep490.sep490.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@RequiredArgsConstructor
@Service
@Log4j2
public class DashboardService {
    private final ClassesRepository classesRepository;
    private final SettingRepository settingRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final CustomStudentEvaluationRepository customStudentEvaluationRepository;
    private final RequirementRepository requirementRepository;

    public DashboardAdminDTO getDashboardAdmin(){
        List<StudentClass> studentClassList= new ArrayList<>();
        List<UserRole> userRoleLists=new ArrayList<>();
        var userList=userRepository.findAll();
        var classList=classesRepository.findAll();
        DashboardAdminDTO dashboard=new DashboardAdminDTO();
        dashboard.setTotalUser(userList.size());
        dashboard.setTotalClass(classList.size());
        for(Classes classes: classList){
            studentClassList.add(new StudentClass(classes.getId(),classes.getName(),classes.getClassesUsers().size()));
        }
        for (Setting setting:settingRepository.findBySettingType("Role")){
            userRoleLists.add(new UserRole(setting.getId(),setting.getName(),setting.getUsers().size()));
        }
        dashboard.setStudentClasses(studentClassList);
        dashboard.setUserRoles(userRoleLists);
        return dashboard;
    }
    public DashboardManagerDTO getDashboardManager(){
        DashboardManagerDTO dashboard=new DashboardManagerDTO();
        dashboard.setTotalStudent(userRepository.findUserByRoleId(Constants.Role.STUDENT).size());
        dashboard.setTotalTeacher(userRepository.findUserByRoleId(Constants.Role.TEACHER).size());
        var listActive=userRepository.findByActiveTrue();
        dashboard.setTotalUserActive(listActive.size());
        if(!listActive.isEmpty()){
            List<UserDashboard> listAtv=new ArrayList<>();
            for(User user:listActive){
                listAtv.add(new UserDashboard(user.getFullname(), user.getEmail()));
            }
            dashboard.setListActive(listAtv);
        }else {
            dashboard.setListActive(new ArrayList<>());
        }

        var listInactive=userRepository.findByActiveFalse();
        dashboard.setTotalUserInactive(listInactive.size());
        if(!listInactive.isEmpty()){
            List<UserDashboard> listAItv=new ArrayList<>();
            for(User user:listInactive){
                listAItv.add(new UserDashboard(user.getFullname(), user.getEmail()));
            }
            dashboard.setListInactive(listAItv);
        }else {
            dashboard.setListInactive(new ArrayList<>());
        }

        return  dashboard;
    }

    public Object getDashboardData(Integer semesterId, Integer subjectId) {
        DashboardResponse response = new DashboardResponse();
        response.setGradeDistributionList(new ArrayList<>());
        response.setOngoingPassFailList(new ArrayList<>());
        response.setAvgRequirementsList(new ArrayList<>());
        response.setAvgGradeList(new ArrayList<>());
        response.setTopLOCGradeList(new ArrayList<>());
        if(semesterId == null || subjectId == null){
            return response;
        }
        try{
            List<Object[]> gradeDistributions = customStudentEvaluationRepository.getDistributionGrades(semesterId, subjectId);
            if(gradeDistributions != null){
                List<GradeDistribution> gradeDistributionList = new ArrayList<>();
                Set<String> gradeL5s = Set.of("0_1", "1_2", "2_3", "3_4", "4_5");
                List<OngoingPassFail> ongoingPassFailList = new ArrayList<>();
                int numberOfGE5 = 0, numberOfL5 = 0, total = 0;
                for (Object[] result : gradeDistributions) {
                    Long numberOfGrade = (Long)result[1];
                    String grade = (String)result[0];
                    gradeDistributionList.add(new GradeDistribution(grade, numberOfGrade));
                    if(gradeL5s.contains(grade)){
                        numberOfL5 += numberOfGrade;
                    } else{
                        numberOfGE5 += numberOfGrade;
                    }
                    total += numberOfGrade;
                }
                ongoingPassFailList.add(new OngoingPassFail(true, numberOfGE5, Math.round((float) numberOfGE5 / total * 100)));
                ongoingPassFailList.add(new OngoingPassFail(false, numberOfL5, Math.round((float) numberOfL5 / total * 100)));
                response.setOngoingPassFailList(ongoingPassFailList);
                response.setGradeDistributionList(gradeDistributionList);
            }

            List<Object[]> avgRequirementList = requirementRepository.getAverageRequirementsPerMember(semesterId, subjectId);
            if(avgRequirementList != null){
                HashMap<String, AvgRequirements> avgRequirementsMap = new HashMap<>();
                for (Object[] av : avgRequirementList) {
                    BigDecimal num = (BigDecimal) av[0];
                    String name = (String)av[1];
                    Integer iter = (Integer) av[2];
                    AvgRequirements existing = avgRequirementsMap.get("GĐ " + iter);
                    if(existing == null){
                        existing = new AvgRequirements();
                        existing.setComplexityAverages(new HashMap<>());
                        existing.setIteration("GĐ " + iter);
                    }
                    existing.getComplexityAverages().put(name, num);
                    avgRequirementsMap.put("GĐ " + iter, existing);
                }
                response.setAvgRequirementsList(avgRequirementsMap.values().stream().toList());
            }

            List<Object[]> avgGradeByMile = customStudentEvaluationRepository.getAvgGradeByMilestone(semesterId, subjectId);
            if(avgGradeByMile != null){
                List<GradeDistribution> avgGradeList = new ArrayList<>();
                for (Object[] result : avgGradeByMile) {
                    Integer iter = (Integer)result[0];
                    Double grade = (Double)result[1];
                    avgGradeList.add(new GradeDistribution("GĐ " + iter, grade));
                }
                response.setAvgGradeList(avgGradeList);
            }

            List<Object[]> topLOCs = customStudentEvaluationRepository.getTopLOC(semesterId, subjectId);
            if(topLOCs != null){
                List<TopLOCGrade> topLOCGradeList = new ArrayList<>();
                for (Object[] result : topLOCs) {
                    Float loc = (Float) result[0];
                    Long numberOfReqs = (Long) result[1];
                    String email = (String) result[2];
                    Integer iter = (Integer) result[3];
                    String classCode = (String) result[4];
                    topLOCGradeList.add(new TopLOCGrade(loc, numberOfReqs, email, "GĐ " + iter, classCode));
                }
                response.setTopLOCGradeList(topLOCGradeList);
            }

            List<Object[]> classAvgGradeList = customStudentEvaluationRepository.getAvgClass(semesterId, subjectId);
            if(classAvgGradeList != null){
                List<ClassAvgGrade> classAvgGrades = new ArrayList<>();
                for (Object[] result : classAvgGradeList) {
                    String classCode = (String) result[0];
                    String email = (String) result[1];
                    Double grade = (Double) result[2];
                    classAvgGrades.add(new ClassAvgGrade(classCode, email, grade));
                }
                response.setClassAvgGradeList(classAvgGrades);
            }
        }catch(Exception e){
            log.info("err statistic: " + e.getMessage());
            throw new ConflictException(e.getMessage());
//            return response;
        }
        return response;
    }
}
