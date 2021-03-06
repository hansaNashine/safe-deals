/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.vsquaresystem.safedeals.pricerange;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.vsquaresystem.safedeals.user.User;
import com.vsquaresystem.safedeals.user.UserDAL;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author hp-pc
 */
@RestController
@RequestMapping("/pricerange")
public class PriceRangeRest {

    private final Logger logger = LoggerFactory.getLogger(getClass());
    @Autowired
    private PriceRangeDAL priceRangeDal;

    @Autowired
    private UserDAL userDAL;

    @RequestMapping(method = RequestMethod.GET)
    public List<PriceRange> findAll(
            @RequestParam(value = "offset", required = false, defaultValue = "0") Integer offset) {
        return priceRangeDal.findAll(offset);
    }

    @RequestMapping(value = "/find_all", method = RequestMethod.GET)
    public List<PriceRange> findAllList() {
        return priceRangeDal.findAllList();
    }

    @RequestMapping(value = "/find_by_minbudget", method = RequestMethod.GET)
    public List<PriceRange> findByMinBudget(@RequestParam("minBudget") Integer minBudget) {
        return priceRangeDal.findByMinBudget(minBudget);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public PriceRange findById(@PathVariable("id") Integer id) {
        return priceRangeDal.findById(id);
    }

    @RequestMapping(method = RequestMethod.POST)
    public PriceRange insert(@RequestBody PriceRange priceRange,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User currentUser) throws JsonProcessingException {
        User user = userDAL.findByUsername(currentUser.getUsername());
        priceRange.setUserId(user.getId());
        return priceRangeDal.insert(priceRange);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.POST)
    public PriceRange update(@RequestBody PriceRange priceRange,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User currentUser) throws JsonProcessingException {
        User user = userDAL.findByUsername(currentUser.getUsername());
        priceRange.setUserId(user.getId());
        return priceRangeDal.update(priceRange);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public void delete(@PathVariable("id") Integer id,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User currentUser) throws JsonProcessingException {
        User user = userDAL.findByUsername(currentUser.getUsername());
        priceRangeDal.delete(id, user.getId());
    }

}
