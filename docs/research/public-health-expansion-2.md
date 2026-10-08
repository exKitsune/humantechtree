# Public health and water-treatment expansion 2

Integration status: accepted into the complete catalog on 2026-10-08; see the [expansion queue](EXPANSION-QUEUE.md) for combined verification. The research and per-agent checks below describe the authoring handoff.

Authoring handoff: revised candidate batch; registration and compilation were left to integration. Articles were read from the local English Wikipedia ZIM dated 2026-08, archive identity **50e94998-c1ec-b5e7-ec34-499f1d907c30**. Focused source text is retained in .cache/public-health-expansion-2/. The new batch has 27 nodes and 23 authored edges. Article resolution supports the cited source's availability, not every historical claim or relationship.

## Scope and evidence

### Water and wastewater

- **Slow sand filtration, 1804.** The “History” section of Slow sand filter states that engineer Robert Thom designed an experimental filter installed by John Gibb at a Paisley bleachery in 1804; Gibb sold surplus water to the public. It then describes refinements over the following decades and James Simpson's Chelsea Waterworks public supply in 1829. The summary now distinguishes the experimental bleachery installation from the later municipal supply. I removed pipe as a parent because this history does not document piping as a physical input to Thom's filter.
- **London water regulation, 1852.** Metropolis Water Act 1852 says the Act established source oversight and required effective filtration for domestic supplies; its covered-pipe and aqueduct provisions describe what the law regulated. The process node remains a parent because a filtration method had already been put into the local public supply. I removed pipe as a parent: being the subject of a law is not, by itself, a contribution to enacting that law.
- **Water chlorination, 1905.** The “History” section of Water chlorination distinguishes early experiments from continuous treatment in Lincoln in 1905 and continuous U.S. use in Jersey City in 1908. The record refers to Lincoln's continuing intervention. The article says a malfunctioning sand filter and contaminated supply precipitated Lincoln's response, but I removed the filter edge because the article documents a trigger for treatment, not a technical contribution to chlorination. Germ theory remains as the independent microbial rationale.
- **Activated sludge, 1913.** Activated sludge dates Ardern and Lockett's process discovery at Davyhulme to 1913, publication to 1914, and a first full-scale continuous-flow system to 1916. The node describes discovery of the process. Sewer collection supplied the incoming sewage treated at the works.
- **Community water fluoridation, 1945.** Water fluoridation says the practice began in 1945 after studies of naturally high-fluoride water. Municipal distribution pipes are retained as the physical means of carrying adjusted water across a service area.
- **London Main Drainage, 1859.** Joseph Bazalgette describes construction starting in 1859 and the interceptor and street sewers that redirected sewage away from streets and the tidal Thames.
- Rapid-sand filtration was deferred because the archive gives a decade (the 1890s), not a supported single year. The reviewed Trickling filter excerpt did not establish an origin year. The archived Bacteriological water analysis and Most probable number excerpts likewise did not establish dates for specific method milestones.

### Local public health

- **Chadwick sanitary report, 1842.** Edwin Chadwick's “Sanitation” material documents a systematic survey of living conditions, poor-law districts, and sanitary needs. The survey is now a root because cities were the subject and setting of its research, not an enabling input.
- **Liverpool Medical Officer of Health, 1847.** History of public health in the United Kingdom says William Henry Duncan held the post from 1847 and was the first UK Medical Officer of Health. The office is now a root; the broad Cities milestone is not a sufficiently specific municipal-administration predecessor.
- **Public Health Act 1848.** The same history says the Act established the General Board of Health, authorized local boards, and empowered them to appoint Medical Officers of Health. Chadwick's earlier sanitary report remains its parent because it prompted official inquiry and helped put sanitation evidence before government. The 1847 Liverpool appointment and the 1848 general statutory framework remain distinct; the Act is not described as the origin of Duncan's post.
- **New York City Metropolitan Board of Health, 1866.** History of public health in the United States supports its formation and its use of citywide inspection, health rules, disinfection, and quarantine. No English predecessor is asserted.

### International coordination and statistics

- **International Sanitary Conferences, 1851.** International Sanitary Conferences and the WHO history describe meetings beginning in 1851 to coordinate rules on international quarantine and epidemic response.
- **Pan-American Sanitary Bureau, 1902.** Pan American Health Organization dates its founding to December 1902. The WHO history connects its founding in part to the prior sanitary-conference series, now reflected as an influence edge.
- **International Office of Public Hygiene, 1907.** The WHO history dates the Paris office to 1907 and says the International Sanitary Conferences contributed to its establishment; WHO later incorporated its staff, assets, and duties. These claims support the new intermediate and its two dated edges.
- **Health Organization of the League of Nations, 1920.** The WHO history states that the League established its Health Organization when it was formed in 1920 and that WHO later incorporated its personnel, assets, and duties. The archive's dedicated Health Organization of the League of Nations page resolved but returned no article body; the WHO history is the source for the date, scope, and successor relationship. This specific organization replaces the earlier too-broad League-of-Nations parent.
- **WHO, 1948.** The WHO page states that the United Nations established WHO as a specialized agency and records the handover from the Paris office and League health organization. WHO has those two specific health predecessors plus the UN agency relationship. The ICD's transfer is described as an inherited responsibility, not a prerequisite to creating WHO, so ICD was removed as a WHO parent.
- **International Classification of Diseases, 1893.** The “Early history” section of International Classification of Diseases dates Jacques Bertillon's cause-of-death classification to 1893 and describes later revisions and adoption. The record describes the scheme's beginning; it does not imply that later morbidity classifications already existed. Civil registration remains an input because registrars' death records could be grouped by the classification.
- **International Health Regulations, 1969.** Notifiable disease states that WHO's 1969 regulations required reports of a specified set of international disease threats.

### U.S. federal reporting and disease control

- **Marine Hospital Service, 1871; National Quarantine Act, 1878; Public Health Service, 1912.** United States Public Health Service describes the 1871 centralization, quarantine authority assigned under the 1878 act, and 1912 name change. Public Health Reports says the act required weekly consular reports of epidemic infections. These sources support the service-to-act, act-to-reporting, and service-renaming edges.
- **Public Health Reports, 1878; Weekly Morbidity Report, 1950.** Public Health Reports says the journal began under the 1878 act and that morbidity and mortality statistics moved to a new weekly report in 1950. Morbidity and Mortality Weekly Report confirms the report's initial name and its lineage.
- **Malaria Control in War Areas, 1942; Communicable Disease Center, 1946.** The CDC history supports the wartime program's mosquito abatement and habitat control, CDC's founding as its successor, and CDC's initial branch status in the Public Health Service. PHS is retained as a direct administrative parent of CDC as well as through the predecessor program; its specific branch relationship is an independent direct input. The modern CDC article has later-current material, which is not used here.

### Community practice

- **Public-health nursing, 1893.** Public health nursing states that Lillian Wald established the Henry Street Settlement and coined the term in 1893. The record remains a root because no specific prior health-service input was established.
- **School medical inspection, New York City, 1892.** School health and nutrition services dates school inspection in France to 1886 and its introduction in New York City to 1892. The record is explicitly scoped to the New York implementation, not to the first worldwide. Public-primary education supplies the organized school setting.

## Verification and remaining questions

In-memory checks against the complete currently registered baseline plus this unregistered batch passed: no duplicate IDs, missing parents, later-dated parents, or cycles. The complete-source directness audit produced no unresolved flags for this batch; the only retained directContribution explanation is the independently documented PHS branch relationship to CDC. The audit identifies review points, not historical verdicts.

Several roots are retained where the inspected source establishes the event but not a nearer graph input: Ragusan maritime quarantine, Chadwick's report, Liverpool's medical officer, the 1804 filtration experiment, New York's board, the international sanitary conferences, the centralized Marine Hospital Service, and public-health nursing.

Useful follow-up: establish supported single-year origins and immediate inputs for rapid-sand filtration, trickling filters, ozone water disinfection, and indicator-organism water analysis. Verify physical water-distribution inputs for any future treatment edge. Do not infer a single institutional ladder between the British and U.S. developments.

Not run by the topic agent: source registration, full authoring-source audit after integration, compilation, data validation, tests, or image metadata. The integration owner subsequently completed these steps; see the expansion queue.
