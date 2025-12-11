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


    test.only("works with observation_iconic_taxon_id when it is a number ", async () => {
      let store = structuredClone(mapStore);

      expectEmpytMap(store);

      let searchparams = "?observation_iconic_taxon_id=1&iconic_taxon_id=3";
      let urlData = decodeAppUrl(searchparams, "/identifications/");

      const mockConnectedCallback = vi.fn(() => true);
      // let connectedResolve = () => {};
      // const connectedPromise = new Promise((r) => (connectedResolve = r));

      window.addEventListener("storePopulated", () => {
        console.log("GOT THE EVENT");
        // connectedR,esolve();
        mockConnectedCallback();
      });

      await initPopulateStore(store, urlData);
      await initRenderMap(store);

      let header = new IdentificationsHeader();
      await header.render();

      // document.body.innerHTML = `
      //      <abc-breadcrumb role="nav" aria-label="Breadcrumb" class="breadcrumb" ismobile="">
      //          ...
      //      </abc-breadcrumb>
      //  `;
      // await window.j.whenAsyncComplete();
      // await connectedPromise;

      expect(mockConnectedCallback).toHaveBeenCalled();

      expect(store.observationsApiParams).toStrictEqual(defaultParams);
      expect(store.identificationsApiParams).toStrictEqual({
        observation_iconic_taxon_id: "1",
        iconic_taxon_id: "3",
      });
    });
