    let paramsTemp = {} as any;
    if (isObservationsCheck(appStore)) {
      paramsTemp = {
        ...appStore.observationsApiParams,
        taxon_id: taxon.id.toString(),
        color: taxon.color,
      };

      // NOTE: iNat observations API only allows one ident_user_id value
      let identifierId = appStore.observationsApiParams.ident_user_id;
      if (identifierId) {
        identifierId = identifierId.split(",")[0];
        paramsTemp.ident_user_id = identifierId;
      }
    } else {
      let params = cleanupIdentificationsMapParams(
        appStore.identificationsApiParams,
      );

      paramsTemp = {
        ...params,
        taxon_id: taxon.id.toString(),
        color: taxon.color,
      };
      console.log("updateTilesForSelectedTaxa 1", paramsTemp);
    }
