/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.vsquaresystem.safedeals.user;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Repository;

/**
 *
 * @author hp4
 */
@Repository
public class UserDAL {

    public static final class Columns {

        public static final String ID = "id";
        public static final String USERNAME = "username";
        public static final String PASSWORD = "password";
        public static final String USER_TYPE = "user_type";
        public static final String NAME = "name";
        public static final String NAME_OF_COMPANY = "name_of_company";
        public static final String ADDRESS = "address";
        public static final String MOBILE_NO = "mobile_no";
        public static final String CITY_ID = "city_id";
        public static final String APPROVED = "approved";
    }

    public static final String TABLE_NAME = "user";

    private final SimpleJdbcInsert insertUser;
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public UserDAL(DataSource dataSource) {
        jdbcTemplate = new JdbcTemplate(dataSource);
        insertUser = new SimpleJdbcInsert(jdbcTemplate)
                .withTableName(TABLE_NAME)
                .usingColumns(
                        Columns.USERNAME,
                        Columns.PASSWORD,
                        Columns.USER_TYPE,
                        Columns.NAME,
                        Columns.NAME_OF_COMPANY,
                        Columns.ADDRESS,
                        Columns.MOBILE_NO,
                        Columns.CITY_ID,
                        Columns.APPROVED
                )
                .usingGeneratedKeyColumns(Columns.ID);
    }

    public List<User> findAll(Integer offset) {

        String sqlQuery = "SELECT * FROM " + TABLE_NAME + " WHERE deleted = FALSE ORDER BY " + Columns.ID + " DESC LIMIT 5 OFFSET ?";
        return jdbcTemplate.query(sqlQuery, new Object[]{offset}, new BeanPropertyRowMapper<>(User.class));
    }

    public List<User> findUnapprovedUser() {
        String sqlQuery = "SELECT * FROM " + TABLE_NAME + " WHERE deleted = FALSE AND approved = FALSE ";
        return jdbcTemplate.query(sqlQuery, new Object[]{}, new BeanPropertyRowMapper<>(User.class));
    }

    public Integer countUnapprovedUser() {
        String sqlQuery = "SELECT count(*) FROM " + TABLE_NAME + " WHERE deleted = FALSE AND approved = FALSE ";
        return jdbcTemplate.queryForInt(sqlQuery);
    }

    public User findById(Integer id) {
        String sqlQuery = "SELECT * FROM " + TABLE_NAME + " WHERE deleted = FALSE AND " + Columns.ID + " = ?";
        return jdbcTemplate.queryForObject(sqlQuery, new Object[]{id}, new BeanPropertyRowMapper<>(User.class));
    }

    public User findByUsername(String username) {

        String sqlQuery = "SELECT * FROM " + TABLE_NAME + " WHERE deleted = FALSE AND approved = TRUE AND " + Columns.USERNAME + " = ?";
        return jdbcTemplate.queryForObject(sqlQuery, new Object[]{username}, new BeanPropertyRowMapper<>(User.class));
    }

    public List<User> findByNameLike(String username) {
        String sqlQuery = "SELECT * FROM " + TABLE_NAME + " WHERE deleted = FALSE AND lower(username) LIKE?";
        String userNameLike = "%" + username.toLowerCase() + "%";
        return jdbcTemplate.query(sqlQuery, new Object[]{userNameLike}, new BeanPropertyRowMapper<>(User.class));
    }

    public User insert(User user) {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put(Columns.USERNAME, user.getUsername());
        parameters.put(Columns.PASSWORD, user.getPassword());
        parameters.put(Columns.USER_TYPE, user.getUserType().name());
        parameters.put(Columns.NAME, user.getName());
        parameters.put(Columns.NAME_OF_COMPANY, user.getNameOfCompany());
        parameters.put(Columns.ADDRESS, user.getAddress());
        parameters.put(Columns.MOBILE_NO, user.getMobileNo());
        parameters.put(Columns.CITY_ID, user.getCityId());
        parameters.put(Columns.APPROVED, user.getApproved());
        Number newId = insertUser.executeAndReturnKey(parameters);
        user = findById(newId.intValue());
        return user;
    }

    public void delete(Integer id) {
        String sqlQuery = "UPDATE " + TABLE_NAME + " SET deleted=? WHERE " + Columns.ID + "=?";
        jdbcTemplate.update(sqlQuery, new Object[]{true, id});
    }

    public User update(User user) {
        String sqlQuery = "UPDATE " + TABLE_NAME + " SET "
                + Columns.USERNAME + " = ?,"
                + Columns.PASSWORD + " = ?, "
                + Columns.USER_TYPE + " = ?,"
                + Columns.NAME + " = ?, "
                + Columns.NAME_OF_COMPANY + " = ?,"
                + Columns.ADDRESS + " = ?, "
                + Columns.MOBILE_NO + " = ?,"
                + Columns.CITY_ID + " = ?, "
                + Columns.APPROVED + " = ? WHERE " + Columns.ID + " = ?";
        Number updatedCount = jdbcTemplate.update(sqlQuery,
                new Object[]{
                    user.getUsername(),
                    user.getPassword(),
                    user.getUserType().name(),
                    user.getName(),
                    user.getNameOfCompany(),
                    user.getAddress(),
                    user.getMobileNo(),
                    user.getCityId(),
                    user.getApproved(),
                    user.getId()
                });
        user = findById(user.getId());
        return user;
    }

}
