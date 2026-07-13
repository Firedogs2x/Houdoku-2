import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  ApkActiveMapping,
  ApkDefaultDirectoryEnforceResult,
  ApkDirectoryStatus,
  ApkExtensionInfo,
  ApkHoudokuApkBulkSourceEntryResult,
  ApkHoudokuApkBulkSourceMethodSetupResult,
  ApkHoudokuApkMethodSetupResult,
  ApkHoudokuApkSourceMethodSetupResult,
  ApkHoudokuGoodSourceMethodSetupResult,
  ApkHoudokuIntegrationAutopilotQuickStatus,
  ApkHoudokuIntegrationAutopilotSessionResult,
  ApkHoudokuIntegrationCommandAuditBundleResult,
  ApkHoudokuIntegrationCommandExecutionResult,
  ApkHoudokuIntegrationCommandPreflightResult,
  ApkHoudokuIntegrationCommandSuggestion,
  ApkHoudokuIntegrationCommandSuggestionsResult,
  ApkHoudokuIntegrationCompletionPolicy,
  ApkHoudokuIntegrationCompletionPolicyOptions,
  ApkHoudokuIntegrationCompletionPolicyPreset,
  ApkHoudokuIntegrationCompletionPolicyPresetRecommendation,
  ApkHoudokuIntegrationCompletionPolicyPresetRunResult,
  ApkHoudokuIntegrationCompletionPolicyResult,
  ApkHoudokuIntegrationControllerCycleResult,
  ApkHoudokuIntegrationControllerModel,
  ApkHoudokuIntegrationExecutionResult,
  ApkHoudokuIntegrationPlan,
  ApkHoudokuIntegrationStepExecutionResult,
  ApkHoudokuLaunchModel,
  ApkHoudokuLaunchModelOptions,
  ApkHoudokuMainProgramMethodOptions,
  ApkHoudokuMainProgramMethodResult,
  ApkHoudokuNextIntegrationCommandAuditBundleResult,
  ApkHoudokuNextIntegrationCommandExecutionResult,
  ApkHoudokuNextIntegrationCommandPreflightResult,
  ApkHoudokuNextIntegrationCommandTransactionLoopOptions,
  ApkHoudokuNextIntegrationCommandTransactionLoopResult,
  ApkHoudokuNextIntegrationCommandTransactionLoopStopReason,
  ApkHoudokuNextIntegrationCommandTransactionResult,
  ApkHoudokuNextIntegrationStep,
  ApkHoudokuNextIntegrationStepRunResult,
  ApkHoudokuNextTestingCommandAuditBundleResult,
  ApkHoudokuNextTestingCommandExecutionResult,
  ApkHoudokuNextTestingCommandPreflightResult,
  ApkHoudokuNextTestingCommandTransactionLoopOptions,
  ApkHoudokuNextTestingCommandTransactionLoopResult,
  ApkHoudokuNextTestingCommandTransactionLoopStopReason,
  ApkHoudokuNextTestingCommandTransactionResult,
  ApkHoudokuPollingUpdateResult,
  ApkHoudokuReadyStatus,
  ApkHoudokuTestReadyOptions,
  ApkHoudokuTestReadyResult,
  ApkHoudokuTestingAutopilotOptions,
  ApkHoudokuTestingAutopilotQuickStatus,
  ApkHoudokuTestingAutopilotResult,
  ApkHoudokuTestingAutopilotSessionResult,
  ApkHoudokuTestingCommandAuditBundleResult,
  ApkHoudokuTestingCommandExecutionResult,
  ApkHoudokuTestingCommandPreflightResult,
  ApkHoudokuTestingCommandSuggestion,
  ApkHoudokuTestingCommandSuggestionsResult,
  ApkHoudokuTestingCompletionPolicy,
  ApkHoudokuTestingCompletionPolicyOptions,
  ApkHoudokuTestingCompletionPolicyPreset,
  ApkHoudokuTestingCompletionPolicyPresetRecommendation,
  ApkHoudokuTestingCompletionPolicyPresetRunResult,
  ApkHoudokuTestingCompletionPolicyResult,
  ApkHoudokuTestingControllerCycleResult,
  ApkHoudokuTestingControllerModel,
  ApkHoudokuTestingControllerModelOptions,
  ApkHoudokuTestingDispatchModel,
  ApkHoudokuTestingEntryModel,
  ApkHoudokuTestingExecutionSummary,
  ApkHoudokuTestingFunctionalRunResult,
  ApkHoudokuTestingModel,
  ApkHoudokuTestingModelOptions,
  ApkHoudokuTestingPreset,
  ApkHoudokuTestingPrimaryActionRunResult,
  ApkHoudokuTestingQuickStartResult,
  ApkHoudokuTestingSessionLoopOptions,
  ApkHoudokuTestingSessionLoopResult,
  ApkHoudokuTestingSessionLoopStopReason,
  ApkHoudokuTestingSessionRunResult,
  ApkLastRepairMetadata,
  ApkMigrationEntry,
  ApkMigrationReport,
  ApkPreferredSelectionBulkOperationResult,
  ApkPreferredSelectionCandidate,
  ApkPreferredSelectionOperationResult,
  ApkPreferredSelectionReason,
  ApkRuntimeActionHint,
  ApkRuntimeActionHintCode,
  ApkRuntimeBootstrapResult,
  ApkRuntimeConfig,
  ApkRuntimeDiagnostic,
  ApkRuntimeDigest,
  ApkRuntimeFilesystemSyncResult,
  ApkRuntimeHealthSummary,
  ApkRuntimeMaintenanceCycleOptions,
  ApkRuntimeMaintenanceCycleResult,
  ApkRuntimeMessage,
  ApkRuntimePollingDecision,
  ApkRuntimeQuickStatus,
  ApkRuntimeRepairResult,
  ApkRuntimeStabilizeResult,
  ApkRuntimeStabilizeStep,
  ApkRuntimeStartupPreparationResult,
  ApkRuntimeState,
  ApkRuntimeStrictStartupGateOptions,
  ApkRuntimeStrictStartupGateRecommendation,
  ApkRuntimeStrictStartupGateResult,
  ApkRuntimeStrictStartupProfile,
  ApkRuntimeSuggestedActionResult,
  ApkSelectionCleanupResult,
  ApkSelectionReason,
  ApkSelectionRecommendation,
  ApkSelectionState,
  ApkSourceGroup,
  ApkSourceMapping,
  ApkSourceOption,
  ApkSourceReadinessStatus,
  ApkSourceReadinessSummary,
  ApkStartupExecutionSummary,
  ApkStartupRemediationOverrides,
  ApkStartupRemediationPlan,
  ApkStartupRemediationRunResult,
  ApkStartupRemediationStep,
  ApkStartupRemediationStepRunResult,
  ApkStartupRemediationUntilStableOptions,
  ApkStartupRemediationUntilStableResult,
  ApkStartupRemediationUntilStableStopReason,
  ApkUiModel,
  ApkUnneededExtensionCandidate,
  ApkUnneededExtensionCleanupEntry,
  ApkUnneededExtensionCleanupOptions,
  ApkUnneededExtensionCleanupPolicy,
  ApkUnneededExtensionCleanupResult,
  ExtensionClientInterface,
  ExtensionMetadata,
  ExternalClient,
  TiyoClientAbstract,
  WebviewFunc,
} from '@houdoku/common';
import { BrowserWindow } from 'electron';
import packageJson from '../package.json';
import * as anatanomotokare from './extensions/anatanomotokare';
import * as arcrelight from './extensions/arcrelight';
import * as assortedscans from './extensions/assortedscans';
import * as comick from './extensions/comick';
import * as deathtollscans from './extensions/deathtollscans';
import * as disasterscans from './extensions/disasterscans';
import * as guya from './extensions/guya';
import * as hniscantrad from './extensions/hniscantrad';
import * as immortalupdates from './extensions/immortalupdates';
import * as isekaiscan from './extensions/isekaiscan';
import * as kireicake from './extensions/kireicake';
import * as komga from './extensions/komga';
import * as komikcast from './extensions/komikcast';
import * as kouhaiwork from './extensions/kouhaiwork';
import * as lecercleduscan from './extensions/lecercleduscan';
import * as leviatanscans from './extensions/leviatanscans';
import * as lilyreader from './extensions/lilyreader';
import * as lupiteam from './extensions/lupiteam';
import * as manga347 from './extensions/manga347';
import * as mangabat from './extensions/mangabat';
import * as mangadex from './extensions/mangadex';
import * as mangakakalot from './extensions/mangakakalot';
import * as mangakatana from './extensions/mangakatana';
import * as mangakik from './extensions/mangakik';
import * as mangalife from './extensions/mangalife';
import * as manganato from './extensions/manganato';
import * as mangapill from './extensions/mangapill';
import * as mangasee from './extensions/mangasee';
import * as mangatellers from './extensions/mangatellers';
import * as menudofansub from './extensions/menudofansub';
import * as nana from './extensions/nana';
import * as nhentai from './extensions/nhentai';
import * as nifteam from './extensions/nifteam';
import * as phoenixscans from './extensions/phoenixscans';
import * as readcomiconline from './extensions/readcomiconline';
import * as sensescans from './extensions/sensescans';
import * as silentsky from './extensions/silentsky';
import * as sleepingknightscans from './extensions/sleepingknightscans';
import * as tcbscans from './extensions/tcb-scans';
import * as toonily from './extensions/toonily';
import * as tortugaceviri from './extensions/tortugaceviri';
import * as tritiniascans from './extensions/tritiniascans';
import * as tuttoanimemanga from './extensions/tuttoanimemanga';
import * as yuriism from './extensions/yuriism';
import * as zandynofansub from './extensions/zandynofansub';
import {
  getApkExtensionInfoList,
  getDefaultApkConfigFilePath,
  getDefaultApkExtensionsDirectory,
  getDefaultApkSelectionFilePath,
  readApkRuntimeConfig,
  readApkSelectionState,
  writeApkRuntimeConfig,
  writeApkSelectionState,
} from './external/apk';
import {
  getApkAdapterProfile,
  getSupportedApkAdapterSourceKeys,
  hasApkAdapterProfile,
} from './external/apk-adapters';
import { buildSourceKeyToExtensionInfo, toCanonicalSourceKey } from './external/apk-source-keys';
import { loadInWebView } from './util/webview';

export class TiyoClient extends TiyoClientAbstract {
  private _apkExtensionsCache: ApkExtensionInfo[] | undefined;
  private _apkSelectionStateCache: ApkSelectionState | undefined;
  private _apkRuntimeConfigCache: ApkRuntimeConfig | undefined;

  constructor(spoofWindow: BrowserWindow) {
    super(spoofWindow);
  }

  _webviewFn: WebviewFunc = (url, options) => loadInWebView(this.spoofWindow, url, options);

  override getVersion = () => packageJson.version || '0.0.0';

  override getDefaultApkExtensionsDirectoryPath = (): string => {
    return path.resolve(getDefaultApkExtensionsDirectory());
  };

  override useDefaultApkExtensionsDirectory = (): ApkRuntimeConfig => {
    const currentConfig = this._getPersistedRuntimeConfig();
    const nextConfig: ApkRuntimeConfig = {
      ...currentConfig,
      apkExtensionsDirectory: this.getDefaultApkExtensionsDirectoryPath(),
    };

    this._writeRuntimeConfig(nextConfig);
    this.refreshApkExtensions();
    return this.getApkRuntimeConfig();
  };

  override getApkDirectoryStatus = (): ApkDirectoryStatus => {
    const defaultDirectory = this.getDefaultApkExtensionsDirectoryPath();
    const currentDirectory = this.getApkExtensionsDirectory();

    return {
      defaultDirectory,
      currentDirectory,
      isUsingDefaultDirectory: currentDirectory === defaultDirectory,
      directoryExists: fs.existsSync(currentDirectory),
      apkCount: this.getApkExtensions().length,
    };
  };

  override enforceDefaultApkDirectory = (): ApkDefaultDirectoryEnforceResult => {
    const runtimeConfig = this.useDefaultApkExtensionsDirectory();
    return {
      runtimeConfig,
      directoryStatus: this.getApkDirectoryStatus(),
    };
  };

  override getApkExtensionsDirectory = () => {
    const configuredDirectory = process.env['TIYO_APK_EXTENSIONS_DIR'];
    if (configuredDirectory !== undefined && configuredDirectory.length > 0) {
      return path.resolve(configuredDirectory);
    }

    const persistedDirectory = this.getApkRuntimeConfig().apkExtensionsDirectory;
    if (persistedDirectory !== undefined && persistedDirectory.length > 0) {
      return path.resolve(persistedDirectory);
    }

    return path.resolve(getDefaultApkExtensionsDirectory());
  };

  private _getApkConfigFilePath = () => {
    const configuredFilePath = process.env['TIYO_APK_CONFIG_FILE'];
    if (configuredFilePath !== undefined && configuredFilePath.length > 0) {
      return configuredFilePath;
    }

    return getDefaultApkConfigFilePath();
  };

  private _getPersistedRuntimeConfig = (): ApkRuntimeConfig => {
    if (this._apkRuntimeConfigCache === undefined) {
      this._apkRuntimeConfigCache = readApkRuntimeConfig(this._getApkConfigFilePath());
    }

    return this._apkRuntimeConfigCache;
  };

  private _setPersistedRuntimeConfig = (config: ApkRuntimeConfig) => {
    this._apkRuntimeConfigCache = config;
    writeApkRuntimeConfig(config, this._getApkConfigFilePath());
  };

  private _writeRuntimeConfig = (nextConfig: ApkRuntimeConfig) => {
    if (
      nextConfig.apkExtensionsDirectory === undefined &&
      nextConfig.apkOnlyMode === undefined &&
      nextConfig.adapterRequiredMode === undefined &&
      nextConfig.lastRepair === undefined
    ) {
      this._setPersistedRuntimeConfig({});
      return;
    }

    this._setPersistedRuntimeConfig(nextConfig);
  };

  override getApkRuntimeConfig = () => {
    return this._getPersistedRuntimeConfig();
  };

  override getLastApkRepairMetadata = (): ApkLastRepairMetadata | undefined => {
    return this.getApkRuntimeConfig().lastRepair;
  };

  override setApkExtensionsDirectory = (directory: string) => {
    const normalizedDirectory = directory.trim();
    const currentConfig = this._getPersistedRuntimeConfig();
    const nextConfig: ApkRuntimeConfig =
      normalizedDirectory.length > 0
        ? { ...currentConfig, apkExtensionsDirectory: normalizedDirectory }
        : { ...currentConfig, apkExtensionsDirectory: undefined };

    this._writeRuntimeConfig(nextConfig);

    this.refreshApkExtensions();
    return this.getApkRuntimeConfig();
  };

  override clearApkExtensionsDirectory = () => {
    const currentConfig = this._getPersistedRuntimeConfig();
    const nextConfig: ApkRuntimeConfig = {
      ...currentConfig,
      apkExtensionsDirectory: undefined,
    };

    this._writeRuntimeConfig(nextConfig);

    this.refreshApkExtensions();
    return this.getApkRuntimeConfig();
  };

  override setApkOnlyMode = (enabled: boolean) => {
    const currentConfig = this._getPersistedRuntimeConfig();
    const nextConfig: ApkRuntimeConfig = {
      ...currentConfig,
      apkOnlyMode: enabled,
    };
    this._writeRuntimeConfig(nextConfig);
    return this.getApkRuntimeConfig();
  };

  override setAdapterRequiredMode = (enabled: boolean) => {
    const currentConfig = this._getPersistedRuntimeConfig();
    const nextConfig: ApkRuntimeConfig = {
      ...currentConfig,
      adapterRequiredMode: enabled,
    };
    this._writeRuntimeConfig(nextConfig);
    return this.getApkRuntimeConfig();
  };

  private _getBuiltInMetadataList = () => {
    return [
      anatanomotokare.METADATA,
      arcrelight.METADATA,
      assortedscans.METADATA,
      comick.METADATA,
      deathtollscans.METADATA,
      disasterscans.METADATA,
      guya.METADATA,
      hniscantrad.METADATA,
      immortalupdates.METADATA,
      isekaiscan.METADATA,
      kireicake.METADATA,
      komga.METADATA,
      komikcast.METADATA,
      kouhaiwork.METADATA,
      lecercleduscan.METADATA,
      leviatanscans.METADATA,
      lilyreader.METADATA,
      lupiteam.METADATA,
      manga347.METADATA,
      mangabat.METADATA,
      mangadex.METADATA,
      mangakakalot.METADATA,
      mangakatana.METADATA,
      mangakik.METADATA,
      mangalife.METADATA,
      manganato.METADATA,
      mangapill.METADATA,
      mangasee.METADATA,
      mangatellers.METADATA,
      menudofansub.METADATA,
      nana.METADATA,
      nhentai.METADATA,
      nifteam.METADATA,
      phoenixscans.METADATA,
      readcomiconline.METADATA,
      sensescans.METADATA,
      silentsky.METADATA,
      sleepingknightscans.METADATA,
      tcbscans.METADATA,
      toonily.METADATA,
      tortugaceviri.METADATA,
      tritiniascans.METADATA,
      tuttoanimemanga.METADATA,
      yuriism.METADATA,
      zandynofansub.METADATA,
    ];
  };

  override getApkMigrationReport = (): ApkMigrationReport => {
    const sourceGroups = this.getApkSourceGroups();
    const activeMappings = this.getActiveApkMappings();

    const entries: ApkMigrationEntry[] = this._getBuiltInMetadataList()
      .map((metadata) => {
        const sourceKey = toCanonicalSourceKey(metadata.name);

        const sourceGroup = sourceGroups.find((group) => group.sourceKey === sourceKey);
        const hasSupportedMapping =
          sourceGroup !== undefined &&
          sourceGroup.extensionId === metadata.id &&
          sourceGroup.options.some((option) => option.supported);

        const hasAnyApkForSourceKey = sourceGroup !== undefined && sourceGroup.options.length > 0;
        const selectedOption = sourceGroup?.options.find((option) => option.isSelected);

        const hasActiveAdapter = activeMappings.some(
          (mapping) =>
            mapping.extensionId === metadata.id && hasApkAdapterProfile(mapping.sourceKey),
        );

        const status = hasActiveAdapter
          ? 'adapter-ready'
          : hasSupportedMapping
            ? 'mapped'
            : 'unmapped';

        return {
          extensionId: metadata.id,
          extensionName: metadata.name,
          sourceKey,
          status,
          availableApkCount: sourceGroup?.options.length || 0,
          selectedPackageName: selectedOption?.packageName,
          selectedVersion: selectedOption?.version,
          hasSupportedMapping,
          hasActiveAdapter,
          hasAnyApkForSourceKey,
        } as ApkMigrationEntry;
      })
      .sort((left, right) => left.extensionName.localeCompare(right.extensionName));

    const summary = entries.reduce(
      (acc, entry) => {
        acc.total += 1;
        if (entry.status === 'adapter-ready') {
          acc.adapterReady += 1;
        } else if (entry.status === 'mapped') {
          acc.mapped += 1;
        } else {
          acc.unmapped += 1;
        }
        return acc;
      },
      {
        total: 0,
        adapterReady: 0,
        mapped: 0,
        unmapped: 0,
      },
    );

    return {
      summary,
      entries,
    };
  };

  private _getAdapterEligibleMappings = (activeMappings: ApkActiveMapping[]) => {
    return activeMappings.filter((mapping) => hasApkAdapterProfile(mapping.sourceKey));
  };

  private _getApkDirectoryValidationResult = (apkExtensionsDirectory: string) => {
    if (!fs.existsSync(apkExtensionsDirectory)) {
      return {
        canContinue: false,
        messages: [
          {
            type: 'warning' as const,
            code: 'APK_DIR_MISSING',
            text: `APK directory does not exist: ${apkExtensionsDirectory}`,
          },
        ],
      };
    }

    const stat = fs.statSync(apkExtensionsDirectory);
    if (!stat.isDirectory()) {
      return {
        canContinue: false,
        messages: [
          {
            type: 'error' as const,
            code: 'APK_DIR_INVALID',
            text: `Configured APK path is not a directory: ${apkExtensionsDirectory}`,
          },
        ],
      };
    }

    return {
      canContinue: true,
      messages: [] as ApkRuntimeMessage[],
    };
  };

  private _appendUnsupportedPresenceMessage = (
    messages: ApkRuntimeMessage[],
    sourceMappings: ApkSourceMapping[],
  ) => {
    const unsupportedCount = sourceMappings.filter((entry) => !entry.supported).length;
    if (unsupportedCount > 0) {
      messages.push({
        type: 'warning',
        code: 'APK_UNSUPPORTED_PRESENT',
        text: `${unsupportedCount} APK file(s) are detected but not mapped to a supported source yet.`,
      });
    }
  };

  private _appendSelectionUnresolvedMessages = (
    messages: ApkRuntimeMessage[],
    selectionState: ApkSelectionState,
    activeMappings: ApkActiveMapping[],
  ) => {
    Object.entries(selectionState).forEach(([sourceKey, selection]) => {
      const isActive = activeMappings.some(
        (entry) =>
          entry.sourceKey === sourceKey &&
          entry.selectedPackageName === selection.selectedPackageName,
      );
      if (!isActive) {
        messages.push({
          type: 'warning',
          code: 'APK_SELECTION_UNRESOLVED',
          text: `Selection for source '${sourceKey}' could not be resolved to an active mapping.`,
        });
      }
    });
  };

  private _appendModeConstraintMessages = (
    messages: ApkRuntimeMessage[],
    activeMappings: ApkActiveMapping[],
    runtimeConfig: ApkRuntimeConfig,
  ) => {
    if (activeMappings.length === 0) {
      messages.push({
        type: 'warning',
        code: 'APK_NO_ACTIVE_MAPPING',
        text: 'No active APK-to-source mapping is currently applied.',
      });
    }

    if (runtimeConfig.apkOnlyMode === true && activeMappings.length === 0) {
      messages.push({
        type: 'error',
        code: 'APK_ONLY_MODE_EMPTY',
        text: 'APK-only mode is enabled, but no active APK mappings are available.',
      });
    }

    if (runtimeConfig.adapterRequiredMode === true) {
      const adapterEligibleMappings = this._getAdapterEligibleMappings(activeMappings);
      if (adapterEligibleMappings.length === 0) {
        messages.push({
          type: 'error',
          code: 'APK_ADAPTER_REQUIRED_EMPTY',
          text: 'Adapter-required mode is enabled, but no active APK mappings have adapter profiles.',
        });
      }
    }
  };

  private _getApkRuntimeMessages = (
    apkExtensionsDirectory: string,
    sourceMappings: ApkSourceMapping[],
    selectionState: ApkSelectionState,
    activeMappings: ApkActiveMapping[],
    runtimeConfig: ApkRuntimeConfig,
  ): ApkRuntimeMessage[] => {
    const validationResult = this._getApkDirectoryValidationResult(apkExtensionsDirectory);
    if (!validationResult.canContinue) {
      return validationResult.messages;
    }

    const messages: ApkRuntimeMessage[] = [...validationResult.messages];

    if (sourceMappings.length === 0) {
      messages.push({
        type: 'info',
        code: 'APK_NONE_FOUND',
        text: 'No APK files found in the configured directory.',
      });
      return messages;
    }

    this._appendUnsupportedPresenceMessage(messages, sourceMappings);
    this._appendSelectionUnresolvedMessages(messages, selectionState, activeMappings);
    this._appendModeConstraintMessages(messages, activeMappings, runtimeConfig);

    return messages;
  };

  private _pushUnsupportedSourceDiagnostics = (
    diagnostics: ApkRuntimeDiagnostic[],
    sourceMappings: ApkSourceMapping[],
  ) => {
    sourceMappings
      .filter((entry) => !entry.supported)
      .forEach((entry) => {
        diagnostics.push({
          type: 'warning',
          code: 'APK_SOURCE_UNSUPPORTED',
          fileName: entry.apk.fileName,
          packageName: entry.apk.packageName,
          sourceKey: entry.apk.sourceKey,
          text: `Source key '${entry.apk.sourceKey}' is not mapped to a supported extension yet.`,
        });
      });
  };

  private _groupMappingsByPackageName = (sourceMappings: ApkSourceMapping[]) => {
    return sourceMappings.reduce(
      (acc, entry) => {
        if (acc[entry.apk.packageName] === undefined) {
          acc[entry.apk.packageName] = [];
        }
        acc[entry.apk.packageName].push(entry);
        return acc;
      },
      {} as { [packageName: string]: ApkSourceMapping[] },
    );
  };

  private _groupMappingsBySourceVersion = (sourceMappings: ApkSourceMapping[]) => {
    return sourceMappings.reduce(
      (acc, entry) => {
        const versionKey = entry.apk.version || 'unknown';
        const key = `${entry.apk.sourceKey}::${versionKey}`;
        if (acc[key] === undefined) {
          acc[key] = [];
        }
        acc[key].push(entry);
        return acc;
      },
      {} as { [key: string]: ApkSourceMapping[] },
    );
  };

  private _toSelectionReason = (source: 'default' | 'persisted' | 'env'): ApkSelectionReason => {
    if (source === 'env') {
      return 'env-override';
    }

    if (source === 'persisted') {
      return 'persisted-selection';
    }

    return 'newest-supported';
  };

  private _toSourceKey = (value: string): string => {
    return toCanonicalSourceKey(value);
  };

  private _buildMappingsByCanonicalSourceKey = (sourceMappings: ApkSourceMapping[]) => {
    return sourceMappings.reduce(
      (acc, mapping) => {
        const sourceKey = this._toSourceKey(mapping.apk.sourceKey);
        if (acc[sourceKey] === undefined) {
          acc[sourceKey] = [];
        }
        acc[sourceKey].push(mapping);
        return acc;
      },
      {} as { [sourceKey: string]: ApkSourceMapping[] },
    );
  };

  private _buildSourceOption = (
    sourceKey: string,
    mapping: ApkSourceMapping,
    selectedPackageName: string | undefined,
    activeMappings: ApkActiveMapping[],
  ): ApkSourceOption => {
    const isSelected = selectedPackageName === mapping.apk.packageName;
    const isActive = activeMappings.some(
      (entry) =>
        entry.sourceKey === sourceKey && entry.selectedPackageName === mapping.apk.packageName,
    );

    return {
      fileName: mapping.apk.fileName,
      packageName: mapping.apk.packageName,
      version: mapping.apk.version,
      sourceName: mapping.apk.sourceName,
      supported: mapping.supported,
      extensionId: mapping.extensionId,
      extensionName: mapping.extensionName,
      hasAdapterProfile: hasApkAdapterProfile(mapping.apk.sourceKey),
      isSelected,
      isActive,
    };
  };

  private _sortSourceOptions = (options: ApkSourceOption[]): ApkSourceOption[] => {
    return [...options].sort((left, right) => {
      if (left.isSelected !== right.isSelected) {
        return left.isSelected ? -1 : 1;
      }

      const versionCompare = this._compareVersionDesc(left.version, right.version);
      if (versionCompare !== 0) {
        return versionCompare;
      }

      return left.fileName.localeCompare(right.fileName);
    });
  };

  private _buildSourceGroup = (
    sourceKey: string,
    mappings: ApkSourceMapping[],
    selectionState: ApkSelectionState,
    activeMappings: ApkActiveMapping[],
  ): ApkSourceGroup => {
    const selectedPackageName = selectionState[this._toSourceKey(sourceKey)]?.selectedPackageName;
    const firstMapping = mappings[0];
    const groupExtensionName = firstMapping?.extensionName;
    const groupSourceName = groupExtensionName || firstMapping?.apk.sourceName || sourceKey;
    const options = mappings.map((mapping) =>
      this._buildSourceOption(sourceKey, mapping, selectedPackageName, activeMappings),
    );

    return {
      sourceKey,
      sourceName: groupSourceName,
      extensionId: firstMapping?.extensionId,
      extensionName: groupExtensionName,
      selectedPackageName,
      options: this._sortSourceOptions(options),
    };
  };

  private _buildApkSourceGroups = (
    sourceMappings: ApkSourceMapping[],
    selectionState: ApkSelectionState,
    activeMappings: ApkActiveMapping[],
  ): ApkSourceGroup[] => {
    return Object.entries(this._buildMappingsByCanonicalSourceKey(sourceMappings))
      .map(([sourceKey, mappings]) =>
        this._buildSourceGroup(sourceKey, mappings, selectionState, activeMappings),
      )
      .sort((left, right) => left.sourceName.localeCompare(right.sourceName));
  };

  private _getSourceReadinessStatus = (
    sourceGroup: ApkSourceGroup,
    runtimeConfig: ApkRuntimeConfig,
  ): ApkSourceReadinessStatus => {
    const selectedOption = sourceGroup.options.find((option) => option.isSelected);
    const hasSupportedOption = sourceGroup.options.some((option) => option.supported);
    const hasActiveSelection = sourceGroup.options.some((option) => option.isActive);

    if (!hasSupportedOption) {
      return 'unsupported-only';
    }

    if (selectedOption === undefined) {
      return 'no-selection';
    }

    if (!hasActiveSelection) {
      return 'selected-not-active';
    }

    if (runtimeConfig.adapterRequiredMode === true && !selectedOption.hasAdapterProfile) {
      return 'adapter-required-missing-adapter';
    }

    return 'ready';
  };

  private _buildApkSourceReadinessSummaries = (
    sourceGroups: ApkSourceGroup[],
    runtimeConfig: ApkRuntimeConfig,
  ): ApkSourceReadinessSummary[] => {
    return sourceGroups
      .map((sourceGroup) => {
        const selectedOption = sourceGroup.options.find((option) => option.isSelected);

        return {
          sourceKey: sourceGroup.sourceKey,
          sourceName: sourceGroup.sourceName,
          status: this._getSourceReadinessStatus(sourceGroup, runtimeConfig),
          selectedPackageName: selectedOption?.packageName,
          optionCount: sourceGroup.options.length,
          hasSupportedOption: sourceGroup.options.some((option) => option.supported),
          hasActiveSelection: sourceGroup.options.some((option) => option.isActive),
          hasAdapterReadyOption: sourceGroup.options.some((option) => option.hasAdapterProfile),
        } as ApkSourceReadinessSummary;
      })
      .sort((left, right) => left.sourceName.localeCompare(right.sourceName));
  };

  private _isPreferredSelectionEligible = (
    option: ApkSourceOption,
    runtimeConfig: ApkRuntimeConfig,
  ) => {
    if (!option.supported) {
      return false;
    }

    if (runtimeConfig.adapterRequiredMode === true && !option.hasAdapterProfile) {
      return false;
    }

    return true;
  };

  private _buildPreferredSelectionReason = (
    selectedOption: ApkSourceOption | undefined,
    candidateOption: ApkSourceOption | undefined,
    runtimeConfig: ApkRuntimeConfig,
  ): ApkPreferredSelectionReason => {
    if (candidateOption === undefined) {
      return 'none-eligible';
    }

    if (
      selectedOption !== undefined &&
      selectedOption.packageName === candidateOption.packageName
    ) {
      return 'selected-still-valid';
    }

    if (runtimeConfig.adapterRequiredMode === true) {
      return 'adapter-required-supported';
    }

    return 'newest-supported';
  };

  private _buildPreferredSelectionCandidate = (
    sourceGroup: ApkSourceGroup,
    runtimeConfig: ApkRuntimeConfig,
  ): ApkPreferredSelectionCandidate => {
    const selectedOption = sourceGroup.options.find((option) => option.isSelected);
    const candidateOption = sourceGroup.options.find((option) =>
      this._isPreferredSelectionEligible(option, runtimeConfig),
    );

    return {
      sourceKey: sourceGroup.sourceKey,
      sourceName: sourceGroup.sourceName,
      suggestedPackageName: candidateOption?.packageName,
      suggestedVersion: candidateOption?.version,
      reason: this._buildPreferredSelectionReason(selectedOption, candidateOption, runtimeConfig),
    };
  };

  private _buildApkPreferredSelectionCandidates = (
    sourceGroups: ApkSourceGroup[],
    runtimeConfig: ApkRuntimeConfig,
  ): ApkPreferredSelectionCandidate[] => {
    return sourceGroups
      .map((sourceGroup) => this._buildPreferredSelectionCandidate(sourceGroup, runtimeConfig))
      .sort((left, right) => left.sourceName.localeCompare(right.sourceName));
  };

  private _pushDuplicatePackageDiagnostics = (
    diagnostics: ApkRuntimeDiagnostic[],
    mappingsByPackageName: { [packageName: string]: ApkSourceMapping[] },
  ) => {
    Object.values(mappingsByPackageName)
      .filter((entries) => entries.length > 1)
      .forEach((entries) => {
        entries.forEach((entry) => {
          diagnostics.push({
            type: 'warning',
            code: 'APK_DUPLICATE_PACKAGE',
            fileName: entry.apk.fileName,
            packageName: entry.apk.packageName,
            sourceKey: entry.apk.sourceKey,
            text: `Package '${entry.apk.packageName}' appears in multiple APK files.`,
          });
        });
      });
  };

  private _pushDuplicateSourceVersionDiagnostics = (
    diagnostics: ApkRuntimeDiagnostic[],
    mappingsBySourceVersion: { [key: string]: ApkSourceMapping[] },
  ) => {
    Object.values(mappingsBySourceVersion)
      .filter((entries) => entries.length > 1)
      .forEach((entries) => {
        entries.forEach((entry) => {
          diagnostics.push({
            type: 'info',
            code: 'APK_DUPLICATE_SOURCE_VERSION',
            fileName: entry.apk.fileName,
            packageName: entry.apk.packageName,
            sourceKey: entry.apk.sourceKey,
            text: `Multiple APK files share source '${entry.apk.sourceKey}' and version '${entry.apk.version || 'unknown'}'.`,
          });
        });
      });
  };

  private _pushSelectionNotActiveDiagnostics = (
    diagnostics: ApkRuntimeDiagnostic[],
    sourceMappings: ApkSourceMapping[],
    selectionState: ApkSelectionState,
    activeMappings: ApkActiveMapping[],
  ) => {
    Object.entries(selectionState).forEach(([sourceKey, selection]) => {
      const selectedMapping = sourceMappings.find(
        (entry) =>
          entry.apk.sourceKey === sourceKey &&
          entry.apk.packageName === selection.selectedPackageName,
      );
      if (selectedMapping === undefined) {
        return;
      }

      const isActive = activeMappings.some(
        (entry) =>
          entry.sourceKey === sourceKey &&
          entry.selectedPackageName === selection.selectedPackageName,
      );
      if (!isActive) {
        diagnostics.push({
          type: 'warning',
          code: 'APK_SELECTED_NOT_ACTIVE',
          fileName: selectedMapping.apk.fileName,
          packageName: selectedMapping.apk.packageName,
          sourceKey: selectedMapping.apk.sourceKey,
          text: 'This APK is selected for its source but is not currently active.',
        });
      }
    });
  };

  private _pushActiveMappingAdapterDiagnostics = (
    diagnostics: ApkRuntimeDiagnostic[],
    sourceMappings: ApkSourceMapping[],
    activeMappings: ApkActiveMapping[],
  ) => {
    activeMappings.forEach((mapping) => {
      const sourceMapping = sourceMappings.find(
        (entry) =>
          entry.apk.sourceKey === mapping.sourceKey &&
          entry.apk.packageName === mapping.selectedPackageName,
      );
      if (sourceMapping === undefined) {
        return;
      }

      const profile = getApkAdapterProfile(mapping);
      if (profile !== undefined) {
        diagnostics.push({
          type: 'info',
          code: 'APK_ADAPTER_PROFILE_ACTIVE',
          fileName: sourceMapping.apk.fileName,
          packageName: sourceMapping.apk.packageName,
          sourceKey: sourceMapping.apk.sourceKey,
          text: `Adapter profile is active for source '${sourceMapping.apk.sourceKey}'.`,
        });

        if (
          Object.keys(profile.settingsOverride).some(
            (key) => key === 'API base URL' || key === 'Uploads base URL',
          )
        ) {
          diagnostics.push({
            type: 'info',
            code: 'APK_ENDPOINT_OVERRIDE_ACTIVE',
            fileName: sourceMapping.apk.fileName,
            packageName: sourceMapping.apk.packageName,
            sourceKey: sourceMapping.apk.sourceKey,
            text: `Endpoint override settings are active for source '${sourceMapping.apk.sourceKey}'.`,
          });
        }
      } else {
        diagnostics.push({
          type: 'warning',
          code: 'APK_ACTIVE_MAPPING_NO_ADAPTER',
          fileName: sourceMapping.apk.fileName,
          packageName: sourceMapping.apk.packageName,
          sourceKey: sourceMapping.apk.sourceKey,
          text: `No adapter profile is defined for active source '${sourceMapping.apk.sourceKey}'.`,
        });
      }
    });
  };

  private _sortDiagnostics = (diagnostics: ApkRuntimeDiagnostic[]) => {
    return diagnostics.sort((left, right) => {
      const sourceCompare = left.sourceKey.localeCompare(right.sourceKey);
      if (sourceCompare !== 0) {
        return sourceCompare;
      }
      return left.fileName.localeCompare(right.fileName);
    });
  };

  private _getApkRuntimeDiagnostics = (
    sourceMappings: ApkSourceMapping[],
    selectionState: ApkSelectionState,
    activeMappings: ApkActiveMapping[],
  ): ApkRuntimeDiagnostic[] => {
    const diagnostics: ApkRuntimeDiagnostic[] = [];

    this._pushUnsupportedSourceDiagnostics(diagnostics, sourceMappings);
    this._pushDuplicatePackageDiagnostics(
      diagnostics,
      this._groupMappingsByPackageName(sourceMappings),
    );
    this._pushDuplicateSourceVersionDiagnostics(
      diagnostics,
      this._groupMappingsBySourceVersion(sourceMappings),
    );
    this._pushSelectionNotActiveDiagnostics(
      diagnostics,
      sourceMappings,
      selectionState,
      activeMappings,
    );
    this._pushActiveMappingAdapterDiagnostics(diagnostics, sourceMappings, activeMappings);

    return this._sortDiagnostics(diagnostics);
  };

  private _buildApkRuntimeHealthSummary = (
    sourceMappings: ApkSourceMapping[],
    sourceGroups: ApkSourceGroup[],
    activeMappings: ApkActiveMapping[],
    messages: ApkRuntimeMessage[],
    diagnostics: ApkRuntimeDiagnostic[],
  ): ApkRuntimeHealthSummary => {
    const warningCount =
      messages.filter((entry) => entry.type === 'warning').length +
      diagnostics.filter((entry) => entry.type === 'warning').length;
    const errorCount =
      messages.filter((entry) => entry.type === 'error').length +
      diagnostics.filter((entry) => entry.type === 'error').length;
    const blockingCodes = Array.from(
      new Set(messages.filter((entry) => entry.type === 'error').map((entry) => entry.code)),
    ).sort();

    return {
      totalApkFiles: sourceMappings.length,
      totalSourceGroups: sourceGroups.length,
      totalSupportedMappings: sourceMappings.filter((entry) => entry.supported).length,
      totalUnsupportedMappings: sourceMappings.filter((entry) => !entry.supported).length,
      totalActiveMappings: activeMappings.length,
      totalAdapterReadyActiveMappings: this._getAdapterEligibleMappings(activeMappings).length,
      warningCount,
      errorCount,
      hasBlockingErrors: blockingCodes.length > 0,
      blockingCodes,
    };
  };

  private _addRuntimeActionHint = (
    hints: ApkRuntimeActionHint[],
    code: ApkRuntimeActionHintCode,
    type: 'info' | 'warning' | 'error',
    text: string,
  ) => {
    if (hints.some((entry) => entry.code === code)) {
      return;
    }

    hints.push({
      code,
      type,
      text,
    });
  };

  private _buildApkRuntimeActionHints = (
    _sourceMappings: ApkSourceMapping[],
    activeMappings: ApkActiveMapping[],
    runtimeConfig: ApkRuntimeConfig,
    messages: ApkRuntimeMessage[],
  ): ApkRuntimeActionHint[] => {
    const hints: ApkRuntimeActionHint[] = [];
    const messageCodes = new Set(messages.map((entry) => entry.code));

    if (messageCodes.has('APK_DIR_MISSING') || messageCodes.has('APK_DIR_INVALID')) {
      this._addRuntimeActionHint(
        hints,
        'open-apk-directory-settings',
        'error',
        'Set a valid APK extensions directory in runtime settings.',
      );
    }

    if (messageCodes.has('APK_NONE_FOUND')) {
      this._addRuntimeActionHint(
        hints,
        'add-apk-files',
        'info',
        'Add extension APK files to the configured APK directory and refresh runtime state.',
      );
    }

    if (messageCodes.has('APK_UNSUPPORTED_PRESENT')) {
      this._addRuntimeActionHint(
        hints,
        'review-unsupported-apks',
        'warning',
        'Review APK files with unsupported source keys and replace them with supported sources.',
      );
    }

    if (messageCodes.has('APK_SELECTION_UNRESOLVED')) {
      this._addRuntimeActionHint(
        hints,
        'review-source-selection',
        'warning',
        'Update source selection for unresolved mappings or clear stale selections.',
      );
    }

    if (messageCodes.has('APK_NO_ACTIVE_MAPPING')) {
      this._addRuntimeActionHint(
        hints,
        'select-supported-apk',
        'warning',
        'Select at least one supported APK per source to activate mappings.',
      );
    }

    if (
      messageCodes.has('APK_ONLY_MODE_EMPTY') ||
      (runtimeConfig.apkOnlyMode === true && activeMappings.length === 0)
    ) {
      this._addRuntimeActionHint(
        hints,
        'disable-apk-only-mode',
        'error',
        'Disable APK-only mode or activate at least one APK mapping.',
      );
    }

    if (
      messageCodes.has('APK_ADAPTER_REQUIRED_EMPTY') ||
      runtimeConfig.adapterRequiredMode === true
    ) {
      const adapterReadyCount = this._getAdapterEligibleMappings(activeMappings).length;
      if (adapterReadyCount === 0) {
        this._addRuntimeActionHint(
          hints,
          'select-adapter-supported-apk',
          'error',
          'Select an APK source that has an adapter profile for adapter-required mode.',
        );
        this._addRuntimeActionHint(
          hints,
          'disable-adapter-required-mode',
          'error',
          'Disable adapter-required mode until an adapter-supported APK source is active.',
        );
      }
    }

    return hints.sort((left, right) => left.code.localeCompare(right.code));
  };

  override getApkRuntimeActionHints = (): ApkRuntimeActionHint[] => {
    const runtimeConfig = this.getApkRuntimeConfig();
    const sourceMappings = this.getApkSourceMappings();
    const selectionState = this.getApkSelectionState();
    const activeMappings = this.getActiveApkMappings();
    const messages = this._getApkRuntimeMessages(
      this.getApkExtensionsDirectory(),
      sourceMappings,
      selectionState,
      activeMappings,
      runtimeConfig,
    );

    return this._buildApkRuntimeActionHints(
      sourceMappings,
      activeMappings,
      runtimeConfig,
      messages,
    );
  };

  override getApkRuntimeHealthSummary = (): ApkRuntimeHealthSummary => {
    const sourceMappings = this.getApkSourceMappings();
    const selectionState = this.getApkSelectionState();
    const activeMappings = this.getActiveApkMappings();
    const sourceGroups = this._buildApkSourceGroups(sourceMappings, selectionState, activeMappings);
    const messages = this._getApkRuntimeMessages(
      this.getApkExtensionsDirectory(),
      sourceMappings,
      selectionState,
      activeMappings,
      this.getApkRuntimeConfig(),
    );
    const diagnostics = this._getApkRuntimeDiagnostics(
      sourceMappings,
      selectionState,
      activeMappings,
    );

    return this._buildApkRuntimeHealthSummary(
      sourceMappings,
      sourceGroups,
      activeMappings,
      messages,
      diagnostics,
    );
  };

  override getApkSourceReadinessSummaries = (): ApkSourceReadinessSummary[] => {
    const runtimeConfig = this.getApkRuntimeConfig();
    const sourceGroups = this.getApkSourceGroups();
    return this._buildApkSourceReadinessSummaries(sourceGroups, runtimeConfig);
  };

  override getApkPreferredSelectionCandidates = (): ApkPreferredSelectionCandidate[] => {
    const runtimeConfig = this.getApkRuntimeConfig();
    const sourceGroups = this.getApkSourceGroups();
    return this._buildApkPreferredSelectionCandidates(sourceGroups, runtimeConfig);
  };

  private _buildNoSourceOperationResult = (): ApkPreferredSelectionOperationResult => {
    return {
      sourceKey: '',
      status: 'skipped-no-source',
      previousPackageName: undefined,
      selectedPackageName: undefined,
    };
  };

  private _buildNoCandidateOperationResult = (
    sourceKey: string,
    previousPackageName: string | undefined,
  ): ApkPreferredSelectionOperationResult => {
    return {
      sourceKey,
      status: 'skipped-no-candidate',
      previousPackageName,
      selectedPackageName: previousPackageName,
    };
  };

  private _buildInvalidCandidateOperationResult = (
    sourceKey: string,
    previousPackageName: string | undefined,
    suggestedPackageName: string,
  ): ApkPreferredSelectionOperationResult => {
    return {
      sourceKey,
      status: 'skipped-invalid-candidate',
      previousPackageName,
      selectedPackageName: suggestedPackageName,
    };
  };

  private _buildAlreadySelectedOperationResult = (
    sourceKey: string,
    selectedPackageName: string,
  ): ApkPreferredSelectionOperationResult => {
    return {
      sourceKey,
      status: 'skipped-already-selected',
      previousPackageName: selectedPackageName,
      selectedPackageName,
    };
  };

  private _buildAppliedOperationResult = (
    sourceKey: string,
    previousPackageName: string | undefined,
    selectedPackageName: string,
  ): ApkPreferredSelectionOperationResult => {
    return {
      sourceKey,
      status: 'applied',
      previousPackageName,
      selectedPackageName,
    };
  };

  private _applyPreferredSelectionCandidate = (
    normalizedSourceKey: string,
    candidate: ApkPreferredSelectionCandidate,
    mappedBySource: { [sourceKey: string]: ApkSourceMapping[] },
    nextPersisted: ApkSelectionState,
    currentSelectionState: ApkSelectionState,
  ): ApkPreferredSelectionOperationResult => {
    const previousPackageName = currentSelectionState[normalizedSourceKey]?.selectedPackageName;

    if (candidate.suggestedPackageName === undefined) {
      return this._buildNoCandidateOperationResult(normalizedSourceKey, previousPackageName);
    }

    const sourceEntries = mappedBySource[normalizedSourceKey] || [];
    const selectedEntry = this._getSelectedEntryByPackageName(
      sourceEntries,
      candidate.suggestedPackageName,
    );
    if (selectedEntry === undefined) {
      return this._buildInvalidCandidateOperationResult(
        normalizedSourceKey,
        previousPackageName,
        candidate.suggestedPackageName,
      );
    }

    if (previousPackageName === selectedEntry.apk.packageName) {
      return this._buildAlreadySelectedOperationResult(
        normalizedSourceKey,
        selectedEntry.apk.packageName,
      );
    }

    nextPersisted[normalizedSourceKey] = {
      selectedPackageName: selectedEntry.apk.packageName,
      extensionId: selectedEntry.extensionId,
    };

    return this._buildAppliedOperationResult(
      normalizedSourceKey,
      previousPackageName,
      selectedEntry.apk.packageName,
    );
  };

  override autoSelectPreferredApkWithResult = (
    sourceKey: string,
  ): ApkPreferredSelectionOperationResult => {
    const normalizedSourceKey = this._toSourceKey(sourceKey.trim());
    if (normalizedSourceKey.length === 0) {
      return this._buildNoSourceOperationResult();
    }

    const candidatesBySource = this.getApkPreferredSelectionCandidates().reduce(
      (acc, candidate) => {
        acc[candidate.sourceKey] = candidate;
        return acc;
      },
      {} as { [sourceKey: string]: ApkPreferredSelectionCandidate },
    );
    const candidate = candidatesBySource[normalizedSourceKey];
    if (candidate === undefined) {
      const currentSelectionState = this.getApkSelectionState();
      return this._buildNoCandidateOperationResult(
        normalizedSourceKey,
        currentSelectionState[normalizedSourceKey]?.selectedPackageName,
      );
    }

    const mappedBySource = this._getMappedBySource();
    const currentSelectionState = this.getApkSelectionState();
    const currentPersisted = this._getPersistedSelectionState();
    const nextPersisted = { ...currentPersisted } as ApkSelectionState;

    const result = this._applyPreferredSelectionCandidate(
      normalizedSourceKey,
      candidate,
      mappedBySource,
      nextPersisted,
      currentSelectionState,
    );

    if (result.status === 'applied') {
      this._setPersistedSelectionState(nextPersisted);
    }

    return result;
  };

  override autoSelectPreferredApk = (sourceKey: string): ApkSelectionState => {
    this.autoSelectPreferredApkWithResult(sourceKey);
    return this.getApkSelectionState();
  };

  override autoSelectAllPreferredApksWithResult = (): ApkPreferredSelectionBulkOperationResult => {
    const mappedBySource = this._getMappedBySource();
    const currentSelectionState = this.getApkSelectionState();
    const currentPersisted = this._getPersistedSelectionState();
    const nextPersisted = { ...currentPersisted } as ApkSelectionState;
    const candidatesBySource = this.getApkPreferredSelectionCandidates().reduce(
      (acc, candidate) => {
        acc[candidate.sourceKey] = candidate;
        return acc;
      },
      {} as { [sourceKey: string]: ApkPreferredSelectionCandidate },
    );

    const sourceKeys = Object.keys(mappedBySource).sort();
    const results = sourceKeys.map((sourceKey) => {
      const candidate = candidatesBySource[sourceKey];
      if (candidate === undefined) {
        return this._buildNoCandidateOperationResult(
          sourceKey,
          currentSelectionState[sourceKey]?.selectedPackageName,
        );
      }

      return this._applyPreferredSelectionCandidate(
        sourceKey,
        candidate,
        mappedBySource,
        nextPersisted,
        currentSelectionState,
      );
    });

    if (results.some((entry) => entry.status === 'applied')) {
      this._setPersistedSelectionState(nextPersisted);
    }

    const selectionState = this.getApkSelectionState();
    const appliedCount = results.filter((entry) => entry.status === 'applied').length;

    return {
      selectionState,
      appliedCount,
      skippedCount: results.length - appliedCount,
      results,
    };
  };

  override autoSelectAllPreferredApks = (): ApkSelectionState => {
    return this.autoSelectAllPreferredApksWithResult().selectionState;
  };

  private _appendRepairFeedbackMessage = (
    messages: ApkRuntimeMessage[],
    operation: ApkPreferredSelectionBulkOperationResult,
  ) => {
    const code = operation.appliedCount > 0 ? 'APK_REPAIR_APPLIED' : 'APK_REPAIR_NOOP';
    if (messages.some((entry) => entry.code === code)) {
      return;
    }

    messages.push({
      type: 'info',
      code,
      text:
        operation.appliedCount > 0
          ? `Repair applied ${operation.appliedCount} preferred selection update(s).`
          : 'Repair completed with no selection changes needed.',
    });
  };

  private _appendRepairFeedbackActionHint = (
    actionHints: ApkRuntimeActionHint[],
    operation: ApkPreferredSelectionBulkOperationResult,
  ) => {
    const code: ApkRuntimeActionHintCode =
      operation.appliedCount > 0 ? 'repair-applied' : 'repair-noop';
    if (actionHints.some((entry) => entry.code === code)) {
      return;
    }

    actionHints.push({
      code,
      type: 'info',
      text:
        operation.appliedCount > 0
          ? `Repair completed: ${operation.appliedCount} source selection(s) updated.`
          : 'Repair completed: no source selections required updates.',
    });
  };

  private _buildRepairAnnotatedRuntimeState = (
    runtimeState: ApkRuntimeState,
    operation: ApkPreferredSelectionBulkOperationResult,
  ): ApkRuntimeState => {
    const messages = [...runtimeState.messages];
    const actionHints = [...runtimeState.actionHints];

    this._appendRepairFeedbackMessage(messages, operation);
    this._appendRepairFeedbackActionHint(actionHints, operation);

    return {
      ...runtimeState,
      messages,
      actionHints,
    };
  };

  private _buildRuntimeStateVersion = (state: {
    runtimeConfig: ApkRuntimeConfig;
    adapterSupportedSourceKeys: string[];
    healthSummary: ApkRuntimeHealthSummary;
    actionHints: ApkRuntimeActionHint[];
    apkExtensionsDirectory: string;
    apkExtensions: ApkExtensionInfo[];
    sourceMappings: ApkSourceMapping[];
    sourceGroups: ApkSourceGroup[];
    sourceReadinessSummaries: ApkSourceReadinessSummary[];
    preferredSelectionCandidates: ApkPreferredSelectionCandidate[];
    selectionState: ApkSelectionState;
    selectionRecommendations: ApkSelectionRecommendation[];
    activeMappings: ApkActiveMapping[];
    messages: ApkRuntimeMessage[];
    diagnostics: ApkRuntimeDiagnostic[];
  }): string => {
    return createHash('sha1').update(JSON.stringify(state)).digest('hex');
  };

  override repairApkRuntimeState = (): ApkRuntimeRepairResult => {
    const operation = this.autoSelectAllPreferredApksWithResult();
    const lastRepair: ApkLastRepairMetadata = {
      timestamp: new Date().toISOString(),
      appliedCount: operation.appliedCount,
      skippedCount: operation.skippedCount,
    };
    this._writeRuntimeConfig({
      ...this._getPersistedRuntimeConfig(),
      lastRepair,
    });

    const runtimeState = this._buildRepairAnnotatedRuntimeState(
      this.refreshApkRuntimeState(),
      operation,
    );

    return {
      lastRepair,
      operation,
      runtimeState,
    };
  };

  override getApkRuntimeDigest = (): ApkRuntimeDigest => {
    const runtimeState = this.getApkRuntimeState();
    return {
      runtimeStateVersion: runtimeState.runtimeStateVersion,
      healthSummary: runtimeState.healthSummary,
      lastRepair: this.getLastApkRepairMetadata(),
    };
  };

  override hasApkRuntimeDigestChanged = (runtimeStateVersion: string | undefined): boolean => {
    const previousVersion = runtimeStateVersion?.trim();
    if (previousVersion === undefined || previousVersion.length === 0) {
      return true;
    }

    return this.getApkRuntimeDigest().runtimeStateVersion !== previousVersion;
  };

  override getApkRuntimePollingDecision = (
    previousRuntimeStateVersion: string | undefined,
  ): ApkRuntimePollingDecision => {
    const digest = this.getApkRuntimeDigest();
    const previousVersion = previousRuntimeStateVersion?.trim();

    return {
      changed:
        previousVersion === undefined || previousVersion.length === 0
          ? true
          : digest.runtimeStateVersion !== previousVersion,
      digest,
    };
  };

  override getApkRuntimeQuickStatus = (
    previousRuntimeStateVersion: string | undefined,
  ): ApkRuntimeQuickStatus => {
    const decision = this.getApkRuntimePollingDecision(previousRuntimeStateVersion);
    const lastRepair = this.getLastApkRepairMetadata();
    const hasBlockingErrors = decision.digest.healthSummary.hasBlockingErrors;
    const suggestedNextAction = hasBlockingErrors
      ? 'run-repair'
      : decision.changed
        ? 'fetch-runtime-state'
        : 'none';
    const runtimePollIntervalHintMs = hasBlockingErrors ? 2000 : decision.changed ? 3000 : 10000;
    const shouldAutoRepair = suggestedNextAction === 'run-repair';

    return {
      changed: decision.changed,
      hasBlockingErrors,
      shouldAutoRepair,
      appliedCount: lastRepair?.appliedCount || 0,
      skippedCount: lastRepair?.skippedCount || 0,
      runtimePollIntervalHintMs,
      suggestedNextAction,
    };
  };

  override getApkRuntimeBootstrap = (
    previousRuntimeStateVersion: string | undefined,
  ): ApkRuntimeBootstrapResult => {
    const quickStatus = this.getApkRuntimeQuickStatus(previousRuntimeStateVersion);
    const digest = this.getApkRuntimeDigest();

    return {
      quickStatus,
      digest,
      runtimeState: quickStatus.changed ? this.getApkRuntimeState() : undefined,
    };
  };

  override runApkRuntimeSuggestedAction = (
    previousRuntimeStateVersion: string | undefined,
  ): ApkRuntimeSuggestedActionResult => {
    const bootstrap = this.getApkRuntimeBootstrap(previousRuntimeStateVersion);
    const action = bootstrap.quickStatus.suggestedNextAction;

    if (action === 'run-repair') {
      const repairResult = this.repairApkRuntimeState();
      return {
        action,
        performed: true,
        quickStatus: this.getApkRuntimeQuickStatus(undefined),
        digest: this.getApkRuntimeDigest(),
        runtimeState: repairResult.runtimeState,
        repairResult,
      };
    }

    if (action === 'fetch-runtime-state') {
      return {
        action,
        performed: true,
        quickStatus: bootstrap.quickStatus,
        digest: bootstrap.digest,
        runtimeState: bootstrap.runtimeState || this.getApkRuntimeState(),
        repairResult: undefined,
      };
    }

    return {
      action,
      performed: false,
      quickStatus: bootstrap.quickStatus,
      digest: bootstrap.digest,
      runtimeState: undefined,
      repairResult: undefined,
    };
  };

  override syncApkRuntimeWithFilesystem = (
    previousRuntimeStateVersion?: string,
  ): ApkRuntimeFilesystemSyncResult => {
    const baselineRuntimeStateVersion =
      previousRuntimeStateVersion ?? this.getApkRuntimeDigest().runtimeStateVersion;

    this.refreshApkExtensions();
    const autoSelectResult = this.autoSelectAllPreferredApksWithResult();
    const runtimeState = this.getApkRuntimeState();
    const activeSourceKeys = runtimeState.activeMappings
      .map((entry) => entry.sourceKey)
      .sort((left, right) => left.localeCompare(right));

    return {
      previousRuntimeStateVersion,
      runtimeStateVersion: runtimeState.runtimeStateVersion,
      changed: runtimeState.runtimeStateVersion !== baselineRuntimeStateVersion,
      activeSourceKeys,
      autoSelectResult,
      runtimeState,
    };
  };

  override getApkHoudokuPollingUpdate = (
    previousRuntimeStateVersion?: string,
    profile: ApkRuntimeStrictStartupProfile = 'test',
  ): ApkHoudokuPollingUpdateResult => {
    const sync = this.syncApkRuntimeWithFilesystem(previousRuntimeStateVersion);
    const launchModel = this.getApkHoudokuLaunchModel(profile, previousRuntimeStateVersion);

    return {
      changed: sync.changed,
      previousRuntimeStateVersion,
      runtimeStateVersion: sync.runtimeStateVersion,
      activeSourceKeys: sync.activeSourceKeys,
      sync,
      launchModel,
    };
  };

  override runApkHoudokuMainProgramMethod = (
    options?: ApkHoudokuMainProgramMethodOptions,
  ): ApkHoudokuMainProgramMethodResult => {
    const targetDirectory =
      options?.targetDirectory?.trim() && options.targetDirectory.trim().length > 0
        ? options.targetDirectory.trim()
        : this.getDefaultApkExtensionsDirectoryPath();
    const sourceKey = this._toSourceKey((options?.sourceKey || 'mangadex').trim());
    const requestedPackageName = options?.requestedPackageName?.trim();
    const profile = options?.profile || 'test';

    const goodSourceSetup = this.runApkHoudokuGoodSourceMethodSetup(
      sourceKey,
      targetDirectory,
      requestedPackageName,
    );
    const previousRuntimeStateVersion =
      options?.previousRuntimeStateVersion ||
      goodSourceSetup.sourceSetup.setup.startupPreparation.runtimeState.runtimeStateVersion;
    const pollingUpdate = this.getApkHoudokuPollingUpdate(previousRuntimeStateVersion, profile);

    const reasons: string[] = [...goodSourceSetup.reasons];
    if (
      pollingUpdate.activeSourceKeys.length > 0 &&
      !pollingUpdate.activeSourceKeys.includes(sourceKey)
    ) {
      reasons.push(`Source '${sourceKey}' is not present in active source keys.`);
    }

    return {
      targetDirectory,
      sourceKey,
      requestedPackageName,
      goodSourceSetup,
      pollingUpdate,
      success: reasons.length === 0,
      reasons,
    };
  };

  override stabilizeApkRuntimeState = (maxSteps: number = 3): ApkRuntimeStabilizeResult => {
    const normalizedMaxSteps = Number.isFinite(maxSteps) && maxSteps > 0 ? Math.floor(maxSteps) : 1;
    const steps: ApkRuntimeStabilizeStep[] = [];
    let repairsRun = 0;
    let previousRuntimeStateVersion: string | undefined = undefined;

    for (let stepIndex = 0; stepIndex < normalizedMaxSteps; stepIndex += 1) {
      const actionResult = this.runApkRuntimeSuggestedAction(previousRuntimeStateVersion);
      steps.push({
        action: actionResult.action,
        performed: actionResult.performed,
        runtimeStateVersion: actionResult.digest.runtimeStateVersion,
        hasBlockingErrors: actionResult.quickStatus.hasBlockingErrors,
      });

      previousRuntimeStateVersion = actionResult.digest.runtimeStateVersion;
      if (actionResult.action === 'run-repair' && actionResult.performed) {
        repairsRun += 1;
      }

      if (!actionResult.performed) {
        break;
      }
    }

    const finalDigest = this.getApkRuntimeDigest();
    const finalQuickStatus = this.getApkRuntimeQuickStatus(finalDigest.runtimeStateVersion);

    return {
      steps,
      repairsRun,
      finalQuickStatus,
      finalDigest,
      finalRuntimeState: finalQuickStatus.changed ? this.getApkRuntimeState() : undefined,
    };
  };

  override getApkUiModel = (previousRuntimeStateVersion: string | undefined): ApkUiModel => {
    return {
      directoryStatus: this.getApkDirectoryStatus(),
      bootstrap: this.getApkRuntimeBootstrap(previousRuntimeStateVersion),
      migrationReport: this.getApkMigrationReport(),
    };
  };

  override prepareApkRuntimeForHoudokuStartup = (): ApkRuntimeStartupPreparationResult => {
    const directoryEnforceResult = this.enforceDefaultApkDirectory();
    const runtimeConfig = this.setApkOnlyMode(true);
    const cleanupResult = this.cleanupApkSelectionState();
    const autoSelectResult = this.autoSelectAllPreferredApksWithResult();
    const runtimeState = this.refreshApkRuntimeState();

    return {
      directoryStatus: directoryEnforceResult.directoryStatus,
      runtimeConfig,
      cleanupResult,
      autoSelectResult,
      runtimeState,
    };
  };

  override runApkHoudokuApkMethodSetup = (
    targetDirectory?: string,
  ): ApkHoudokuApkMethodSetupResult => {
    const normalizedTargetDirectory =
      targetDirectory?.trim() && targetDirectory.trim().length > 0
        ? targetDirectory.trim()
        : this.getDefaultApkExtensionsDirectoryPath();

    this.setApkExtensionsDirectory(normalizedTargetDirectory);
    this.refreshApkExtensions();

    const runtimeConfig = this.setApkOnlyMode(true);
    const cleanupResult = this.cleanupApkSelectionState();
    const autoSelectResult = this.autoSelectAllPreferredApksWithResult();
    const runtimeState = this.refreshApkRuntimeState();
    const readyStatus = this.getApkHoudokuReadyStatus();

    const startupPreparation: ApkRuntimeStartupPreparationResult = {
      directoryStatus: this.getApkDirectoryStatus(),
      runtimeConfig,
      cleanupResult,
      autoSelectResult,
      runtimeState,
    };

    const usesTargetDirectory =
      path.resolve(startupPreparation.runtimeState.apkExtensionsDirectory) ===
      path.resolve(normalizedTargetDirectory);
    const apkOnlyMode = startupPreparation.runtimeState.runtimeConfig.apkOnlyMode === true;
    const activeSourceKeys = startupPreparation.runtimeState.activeMappings
      .map((entry) => entry.sourceKey)
      .sort((left, right) => left.localeCompare(right));

    const reasons: string[] = [];
    if (!usesTargetDirectory) {
      reasons.push('Runtime did not keep the requested APK extensions directory.');
    }
    if (!apkOnlyMode) {
      reasons.push('APK-only mode is not enabled.');
    }
    if (activeSourceKeys.length === 0) {
      reasons.push('No active APK source mappings were resolved.');
    }

    return {
      targetDirectory: normalizedTargetDirectory,
      startupPreparation,
      readyStatus,
      usesTargetDirectory,
      apkOnlyMode,
      activeSourceKeys,
      success: reasons.length === 0,
      reasons,
    };
  };

  override runApkHoudokuApkSourceMethodSetup = (
    sourceKey: string,
    targetDirectory?: string,
    requestedPackageName?: string,
  ): ApkHoudokuApkSourceMethodSetupResult => {
    const normalizedSourceKey = this._toSourceKey(sourceKey.trim());
    const normalizedRequestedPackageName = requestedPackageName?.trim();
    const setup = this.runApkHoudokuApkMethodSetup(targetDirectory);

    const reasons: string[] = [...setup.reasons];
    if (normalizedSourceKey.length === 0) {
      reasons.push('Source key is required.');
      return {
        sourceKey: normalizedSourceKey,
        requestedPackageName: normalizedRequestedPackageName,
        setup,
        selectedPackageName: undefined,
        activePackageName: undefined,
        extensionId: undefined,
        extensionVisibleInGetExtensions: false,
        success: false,
        reasons,
      };
    }

    const sourceGroup = this.getApkSourceGroups().find(
      (entry) => this._toSourceKey(entry.sourceKey) === normalizedSourceKey,
    );
    if (sourceGroup === undefined) {
      reasons.push(`Source '${normalizedSourceKey}' was not found in APK mappings.`);
      return {
        sourceKey: normalizedSourceKey,
        requestedPackageName: normalizedRequestedPackageName,
        setup,
        selectedPackageName: undefined,
        activePackageName: undefined,
        extensionId: undefined,
        extensionVisibleInGetExtensions: false,
        success: false,
        reasons,
      };
    }

    const supportedOptions = sourceGroup.options.filter((entry) => entry.supported);
    if (supportedOptions.length === 0) {
      reasons.push(`Source '${normalizedSourceKey}' has no supported APK options.`);
      return {
        sourceKey: normalizedSourceKey,
        requestedPackageName: normalizedRequestedPackageName,
        setup,
        selectedPackageName: undefined,
        activePackageName: undefined,
        extensionId: sourceGroup.extensionId,
        extensionVisibleInGetExtensions: false,
        success: false,
        reasons,
      };
    }

    const packageToSelect =
      normalizedRequestedPackageName !== undefined && normalizedRequestedPackageName.length > 0
        ? normalizedRequestedPackageName
        : (() => {
            this.autoSelectPreferredApkWithResult(normalizedSourceKey);
            const selectedPackageName =
              this.getApkSelectionState()[normalizedSourceKey]?.selectedPackageName;
            return selectedPackageName;
          })();
    if (packageToSelect === undefined || packageToSelect.length === 0) {
      reasons.push(
        `Source '${normalizedSourceKey}' does not have a preferred APK candidate to select.`,
      );
      return {
        sourceKey: normalizedSourceKey,
        requestedPackageName: normalizedRequestedPackageName,
        setup,
        selectedPackageName: undefined,
        activePackageName: undefined,
        extensionId: sourceGroup.extensionId,
        extensionVisibleInGetExtensions: false,
        success: false,
        reasons,
      };
    }
    const selectedOption = supportedOptions.find((entry) => entry.packageName === packageToSelect);
    if (selectedOption === undefined) {
      reasons.push(
        `Requested package '${packageToSelect}' is not supported for source '${normalizedSourceKey}'.`,
      );
      return {
        sourceKey: normalizedSourceKey,
        requestedPackageName: normalizedRequestedPackageName,
        setup,
        selectedPackageName: undefined,
        activePackageName: undefined,
        extensionId: sourceGroup.extensionId,
        extensionVisibleInGetExtensions: false,
        success: false,
        reasons,
      };
    }

    this.setApkSourceSelection(normalizedSourceKey, packageToSelect);
    const runtimeState = this.refreshApkRuntimeState();
    const activeMapping = runtimeState.activeMappings.find(
      (entry) => entry.sourceKey === normalizedSourceKey,
    );
    const extensions = this.getExtensions();
    const extensionVisibleInGetExtensions =
      activeMapping !== undefined && extensions[activeMapping.extensionId] !== undefined;

    if (activeMapping === undefined) {
      reasons.push(`Source '${normalizedSourceKey}' did not resolve to an active mapping.`);
    }

    return {
      sourceKey: normalizedSourceKey,
      requestedPackageName: normalizedRequestedPackageName,
      setup,
      selectedPackageName: selectedOption.packageName,
      activePackageName: activeMapping?.selectedPackageName,
      extensionId: activeMapping?.extensionId || sourceGroup.extensionId,
      extensionVisibleInGetExtensions,
      success:
        reasons.length === 0 &&
        activeMapping !== undefined &&
        activeMapping.selectedPackageName === selectedOption.packageName &&
        extensionVisibleInGetExtensions,
      reasons,
    };
  };

  override runApkHoudokuGoodSourceMethodSetup = (
    sourceKey: string,
    targetDirectory?: string,
    requestedPackageName?: string,
  ): ApkHoudokuGoodSourceMethodSetupResult => {
    const sourceSetup = this.runApkHoudokuApkSourceMethodSetup(
      sourceKey,
      targetDirectory,
      requestedPackageName,
    );

    const reasons: string[] = [];
    if (!sourceSetup.success) {
      reasons.push('Source setup did not succeed.');
    }
    if (!sourceSetup.extensionVisibleInGetExtensions) {
      reasons.push('Resolved source extension is not visible in getExtensions().');
    }
    if (
      sourceSetup.selectedPackageName === undefined ||
      sourceSetup.activePackageName === undefined
    ) {
      reasons.push('Selected/active package mapping is incomplete.');
    }
    if (sourceSetup.selectedPackageName !== sourceSetup.activePackageName) {
      reasons.push('Selected package and active package do not match.');
    }

    return {
      sourceKey: sourceSetup.sourceKey,
      requestedPackageName: sourceSetup.requestedPackageName,
      sourceSetup,
      usableByHoudoku: reasons.length === 0,
      reasons,
    };
  };

  override runApkHoudokuApkBulkSourceMethodSetup = (
    targetDirectory?: string,
  ): ApkHoudokuApkBulkSourceMethodSetupResult => {
    const setup = this.runApkHoudokuApkMethodSetup(targetDirectory);
    const reasons: string[] = [...setup.reasons];
    const runtimeState = this.refreshApkRuntimeState();
    const selectionState = this.getApkSelectionState();
    const activeMappingsBySource = new Map(
      runtimeState.activeMappings.map((entry) => [entry.sourceKey, entry]),
    );
    const extensions = this.getExtensions();

    const eligibleSourceGroups = runtimeState.sourceGroups.filter((group) => {
      const selectedPackageName = selectionState[group.sourceKey]?.selectedPackageName;
      const activeMapping = activeMappingsBySource.get(group.sourceKey);
      const hasSupportedOption = group.options.some((entry) => entry.supported);

      return hasSupportedOption || selectedPackageName !== undefined || activeMapping !== undefined;
    });

    const sourceResults: ApkHoudokuApkBulkSourceEntryResult[] = eligibleSourceGroups.map(
      (group) => {
        const selectedPackageName = selectionState[group.sourceKey]?.selectedPackageName;
        const activeMapping = activeMappingsBySource.get(group.sourceKey);
        const extensionVisibleInGetExtensions =
          activeMapping !== undefined && extensions[activeMapping.extensionId] !== undefined;

        const entryReasons: string[] = [];
        if (selectedPackageName === undefined) {
          entryReasons.push('No package is selected for source.');
        }
        if (activeMapping === undefined) {
          entryReasons.push('Selected package did not resolve to an active mapping.');
        }
        if (!extensionVisibleInGetExtensions) {
          entryReasons.push('Resolved extension is not visible in getExtensions().');
        }

        return {
          sourceKey: group.sourceKey,
          selectedPackageName,
          activePackageName: activeMapping?.selectedPackageName,
          extensionId: activeMapping?.extensionId || group.extensionId,
          extensionVisibleInGetExtensions,
          success: entryReasons.length === 0,
          reasons: entryReasons,
        };
      },
    );

    if (sourceResults.length === 0) {
      reasons.push('No APK source groups were discovered.');
    }

    const successfulSourceKeys = sourceResults
      .filter((entry) => entry.success)
      .map((entry) => entry.sourceKey)
      .sort((left, right) => left.localeCompare(right));
    const failedSourceKeys = sourceResults
      .filter((entry) => !entry.success)
      .map((entry) => entry.sourceKey)
      .sort((left, right) => left.localeCompare(right));

    if (failedSourceKeys.length > 0) {
      reasons.push(`Failed to activate ${failedSourceKeys.length} source mapping(s).`);
    }

    return {
      setup,
      sourceResults,
      successfulSourceKeys,
      failedSourceKeys,
      success: reasons.length === 0,
      reasons,
    };
  };

  override runApkHoudokuInstalledApkMethodSetup = (): ApkHoudokuApkBulkSourceMethodSetupResult => {
    return this.runApkHoudokuApkBulkSourceMethodSetup(this.getDefaultApkExtensionsDirectoryPath());
  };

  override getApkHoudokuReadyStatus = (): ApkHoudokuReadyStatus => {
    const runtimeState = this.getApkRuntimeState();
    const directoryStatus = this.getApkDirectoryStatus();
    const quickStatus = this.getApkRuntimeQuickStatus(runtimeState.runtimeStateVersion);
    const unneededExtensions = this.getApkUnneededExtensions();

    const blockingCodes = runtimeState.healthSummary.blockingCodes;
    const warningCodes = [
      ...new Set(
        runtimeState.messages
          .filter((entry) => entry.type === 'warning')
          .map((entry) => entry.code),
      ),
    ].sort((left, right) => left.localeCompare(right));

    const level =
      blockingCodes.length > 0 ? 'blocked' : warningCodes.length > 0 ? 'warning' : 'ready';

    return {
      level,
      isReady: level === 'ready',
      runtimeStateVersion: runtimeState.runtimeStateVersion,
      directoryStatus,
      activeMappingCount: runtimeState.activeMappings.length,
      unsupportedApkCount: runtimeState.sourceMappings.filter((entry) => !entry.supported).length,
      unneededApkCount: unneededExtensions.length,
      blockingCodes,
      warningCodes,
      suggestedNextAction: quickStatus.suggestedNextAction,
    };
  };

  override runApkRuntimeMaintenanceCycle = (
    options?: ApkRuntimeMaintenanceCycleOptions,
  ): ApkRuntimeMaintenanceCycleResult => {
    const applyUnneededCleanup = options?.applyUnneededCleanup === true;
    const unneededCleanupPolicy = options?.unneededCleanupPolicy || 'all-unneeded';
    const stabilizeMaxSteps =
      Number.isFinite(options?.stabilizeMaxSteps) && (options?.stabilizeMaxSteps || 0) > 0
        ? Math.floor(options?.stabilizeMaxSteps || 3)
        : 3;

    const startupPreparation = this.prepareApkRuntimeForHoudokuStartup();
    const unneededCleanup = this.cleanupUnneededApkExtensions({
      apply: applyUnneededCleanup,
      policy: unneededCleanupPolicy,
    });
    const stabilization = this.stabilizeApkRuntimeState(stabilizeMaxSteps);
    const readyStatus = this.getApkHoudokuReadyStatus();

    return {
      options: {
        applyUnneededCleanup,
        unneededCleanupPolicy,
        stabilizeMaxSteps,
      },
      startupPreparation,
      unneededCleanup,
      stabilization,
      readyStatus,
    };
  };

  private _toReadyLevelWeight = (value: ApkHoudokuReadyStatus['level']): number => {
    if (value === 'ready') {
      return 2;
    }

    if (value === 'warning') {
      return 1;
    }

    return 0;
  };

  override runApkRuntimeStrictStartupGate = (
    options?: ApkRuntimeStrictStartupGateOptions,
  ): ApkRuntimeStrictStartupGateResult => {
    const requireReadyLevel = options?.requireReadyLevel || 'ready';
    const requireNoUnsupportedApks = options?.requireNoUnsupportedApks !== false;
    const requireNoUnneededApks = options?.requireNoUnneededApks === true;

    const maintenanceCycle = this.runApkRuntimeMaintenanceCycle(options?.maintenanceOptions);
    const readyStatus = maintenanceCycle.readyStatus;
    const reasons: string[] = [];

    if (this._toReadyLevelWeight(readyStatus.level) < this._toReadyLevelWeight(requireReadyLevel)) {
      reasons.push(
        `Readiness level '${readyStatus.level}' does not meet required level '${requireReadyLevel}'.`,
      );
    }

    if (requireNoUnsupportedApks && readyStatus.unsupportedApkCount > 0) {
      reasons.push(
        `Detected ${readyStatus.unsupportedApkCount} unsupported APK file(s) while strict startup requires zero.`,
      );
    }

    if (requireNoUnneededApks && readyStatus.unneededApkCount > 0) {
      reasons.push(
        `Detected ${readyStatus.unneededApkCount} unneeded APK file(s) while strict startup requires zero.`,
      );
    }

    return {
      options: {
        requireReadyLevel,
        requireNoUnsupportedApks,
        requireNoUnneededApks,
      },
      maintenanceCycle,
      readyStatus,
      passed: reasons.length === 0,
      reasons,
    };
  };

  override getApkRecommendedStrictStartupGate = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
  ): ApkRuntimeStrictStartupGateRecommendation => {
    if (profile === 'dev') {
      return {
        profile,
        options: {
          maintenanceOptions: {
            applyUnneededCleanup: false,
            unneededCleanupPolicy: 'unsupported-only',
            stabilizeMaxSteps: 2,
          },
          requireReadyLevel: 'warning',
          requireNoUnsupportedApks: false,
          requireNoUnneededApks: false,
        },
        notes: [
          'Development profile favors fast iteration and non-destructive maintenance.',
          'Unsupported and unneeded APKs are tolerated for local testing workflows.',
        ],
      };
    }

    if (profile === 'prod') {
      return {
        profile,
        options: {
          maintenanceOptions: {
            applyUnneededCleanup: false,
            unneededCleanupPolicy: 'all-unneeded',
            stabilizeMaxSteps: 3,
          },
          requireReadyLevel: 'ready',
          requireNoUnsupportedApks: true,
          requireNoUnneededApks: true,
        },
        notes: [
          'Production profile enforces clean APK inventory and full readiness.',
          'Enable apply cleanup explicitly only in controlled maintenance windows.',
        ],
      };
    }

    return {
      profile: 'test',
      options: {
        maintenanceOptions: {
          applyUnneededCleanup: false,
          unneededCleanupPolicy: 'unsupported-only',
          stabilizeMaxSteps: 2,
        },
        requireReadyLevel: 'warning',
        requireNoUnsupportedApks: true,
        requireNoUnneededApks: false,
      },
      notes: [
        'Test profile requires supported mappings while keeping cleanup non-destructive by default.',
        'Suitable for CI and pre-release verification with deterministic gate checks.',
      ],
    };
  };

  override runApkRecommendedStrictStartupGate = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
  ): ApkRuntimeStrictStartupGateResult => {
    const recommendation = this.getApkRecommendedStrictStartupGate(profile);
    return this.runApkRuntimeStrictStartupGate(recommendation.options);
  };

  private _mergeStrictStartupGateOptions = (
    base: ApkRuntimeStrictStartupGateOptions,
    overrides?: ApkStartupRemediationOverrides,
  ): ApkRuntimeStrictStartupGateOptions => {
    if (overrides === undefined) {
      return base;
    }

    const baseMaintenance = base.maintenanceOptions;
    const overrideMaintenance = overrides.maintenanceOptions;

    return {
      ...base,
      ...overrides,
      maintenanceOptions:
        baseMaintenance === undefined && overrideMaintenance === undefined
          ? undefined
          : {
              ...(baseMaintenance || {}),
              ...(overrideMaintenance || {}),
            },
    };
  };

  private _getStrictStartupRecommendationWithOverrides = (
    profile: ApkRuntimeStrictStartupProfile,
    overrides?: ApkStartupRemediationOverrides,
  ): ApkRuntimeStrictStartupGateRecommendation => {
    const recommendation = this.getApkRecommendedStrictStartupGate(profile);
    if (overrides === undefined) {
      return recommendation;
    }

    return {
      ...recommendation,
      options: this._mergeStrictStartupGateOptions(recommendation.options, overrides),
      notes: [
        ...recommendation.notes,
        'Runtime remediation overrides were applied for this execution.',
      ],
    };
  };

  private _toRemediationStepFromHint = (hint: ApkRuntimeActionHint): ApkStartupRemediationStep => {
    const methodByHintCode: { [code: string]: ApkStartupRemediationStep['method'] } = {
      'open-apk-directory-settings': 'setApkExtensionsDirectory',
      'add-apk-files': 'refreshApkRuntimeState',
      'review-unsupported-apks': 'cleanupUnneededApkExtensions',
      'review-source-selection': 'autoSelectAllPreferredApksWithResult',
      'select-supported-apk': 'autoSelectAllPreferredApksWithResult',
      'disable-apk-only-mode': 'setApkOnlyMode',
      'disable-adapter-required-mode': 'setAdapterRequiredMode',
      'select-adapter-supported-apk': 'autoSelectAllPreferredApksWithResult',
      'repair-applied': 'runApkRuntimeMaintenanceCycle',
      'repair-noop': 'runApkRuntimeStrictStartupGate',
    };

    return {
      code: hint.code,
      type: hint.type,
      text: hint.text,
      method: methodByHintCode[hint.code] || 'runApkRuntimeMaintenanceCycle',
      autoRunnable: hint.type !== 'error',
    };
  };

  private _dedupeRemediationSteps = (
    steps: ApkStartupRemediationStep[],
  ): ApkStartupRemediationStep[] => {
    const seen = new Set<string>();
    const priority: { [type: string]: number } = {
      error: 0,
      warning: 1,
      info: 2,
    };

    return steps
      .sort((left, right) => {
        const typeCompare = (priority[left.type] || 9) - (priority[right.type] || 9);
        if (typeCompare !== 0) {
          return typeCompare;
        }

        return left.code.localeCompare(right.code);
      })
      .filter((step) => {
        if (seen.has(step.code)) {
          return false;
        }

        seen.add(step.code);
        return true;
      });
  };

  override getApkStartupRemediationPlan = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
  ): ApkStartupRemediationPlan => {
    const recommendation = this.getApkRecommendedStrictStartupGate(profile);
    const strictGate = this.runApkRuntimeStrictStartupGate(recommendation.options);
    const hintSteps = strictGate.maintenanceCycle.startupPreparation.runtimeState.actionHints.map(
      this._toRemediationStepFromHint,
    );

    const reasonSteps = strictGate.reasons.map((reason, index) => ({
      code: `strict-gate-reason-${index + 1}`,
      type: 'error' as const,
      text: reason,
      method: 'runApkRuntimeMaintenanceCycle' as const,
      autoRunnable: false,
    }));

    return {
      profile,
      recommendation,
      strictGate,
      steps: this._dedupeRemediationSteps([...reasonSteps, ...hintSteps]),
    };
  };

  private _runAutoRemediationMethod = (
    method: ApkStartupRemediationStep['method'],
    recommendation: ApkRuntimeStrictStartupGateRecommendation,
  ): { performed: boolean; note: string } => {
    if (method === 'refreshApkRuntimeState') {
      this.refreshApkRuntimeState();
      return { performed: true, note: 'Runtime state refreshed.' };
    }

    if (method === 'cleanupUnneededApkExtensions') {
      const maintenanceOptions = recommendation.options.maintenanceOptions;
      this.cleanupUnneededApkExtensions({
        apply: maintenanceOptions?.applyUnneededCleanup === true,
        policy: maintenanceOptions?.unneededCleanupPolicy || 'unsupported-only',
      });
      return { performed: true, note: 'Unneeded APK cleanup method executed.' };
    }

    if (method === 'autoSelectAllPreferredApksWithResult') {
      this.autoSelectAllPreferredApksWithResult();
      return { performed: true, note: 'Preferred APK selections applied.' };
    }

    if (method === 'runApkRuntimeMaintenanceCycle') {
      this.runApkRuntimeMaintenanceCycle(recommendation.options.maintenanceOptions);
      return { performed: true, note: 'Maintenance cycle executed.' };
    }

    if (method === 'runApkRuntimeStrictStartupGate') {
      this.runApkRuntimeStrictStartupGate(recommendation.options);
      return { performed: true, note: 'Strict startup gate executed.' };
    }

    return {
      performed: false,
      note: `Method '${method}' requires manual input or explicit operator choice.`,
    };
  };

  override runApkStartupRemediation = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
  ): ApkStartupRemediationRunResult => {
    return this.runApkStartupRemediationWithOverrides(profile, undefined);
  };

  override runApkStartupRemediationWithOverrides = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
    overrides?: ApkStartupRemediationOverrides,
  ): ApkStartupRemediationRunResult => {
    const recommendation = this._getStrictStartupRecommendationWithOverrides(profile, overrides);
    const strictGate = this.runApkRuntimeStrictStartupGate(recommendation.options);
    const hintSteps = strictGate.maintenanceCycle.startupPreparation.runtimeState.actionHints.map(
      this._toRemediationStepFromHint,
    );

    const reasonSteps = strictGate.reasons.map((reason, index) => ({
      code: `strict-gate-reason-${index + 1}`,
      type: 'error' as const,
      text: reason,
      method: 'runApkRuntimeMaintenanceCycle' as const,
      autoRunnable: false,
    }));

    const plan: ApkStartupRemediationPlan = {
      profile,
      recommendation,
      strictGate,
      steps: this._dedupeRemediationSteps([...reasonSteps, ...hintSteps]),
    };

    const beforeGate = plan.strictGate;
    const executedMethods = new Set<ApkStartupRemediationStep['method']>();

    const stepResults: ApkStartupRemediationStepRunResult[] = plan.steps.map((step) => {
      if (!step.autoRunnable) {
        return {
          code: step.code,
          method: step.method,
          attempted: false,
          performed: false,
          note: 'Step requires manual remediation.',
        };
      }

      if (executedMethods.has(step.method)) {
        return {
          code: step.code,
          method: step.method,
          attempted: false,
          performed: false,
          note: 'Skipped duplicate method; already executed in this remediation run.',
        };
      }

      executedMethods.add(step.method);
      const execution = this._runAutoRemediationMethod(step.method, plan.recommendation);
      return {
        code: step.code,
        method: step.method,
        attempted: true,
        performed: execution.performed,
        note: execution.note,
      };
    });

    const afterGate = this.runApkRuntimeStrictStartupGate(recommendation.options);
    const improved =
      afterGate.passed ||
      afterGate.reasons.length < beforeGate.reasons.length ||
      this._toReadyLevelWeight(afterGate.readyStatus.level) >
        this._toReadyLevelWeight(beforeGate.readyStatus.level);

    return {
      profile,
      plan,
      usedOverrides: overrides,
      beforeGate,
      afterGate,
      improved,
      stepResults,
    };
  };

  override runApkStartupRemediationUntilStable = (
    options?: ApkStartupRemediationUntilStableOptions,
  ): ApkStartupRemediationUntilStableResult => {
    const profile = options?.profile || 'test';
    const overrides = options?.overrides;
    const maxRuns =
      Number.isFinite(options?.maxRuns) && (options?.maxRuns || 0) > 0
        ? Math.floor(options?.maxRuns || 1)
        : 3;

    const runs: ApkStartupRemediationRunResult[] = [];
    let stopReason: ApkStartupRemediationUntilStableStopReason = 'max-runs';

    for (let runIndex = 0; runIndex < maxRuns; runIndex += 1) {
      const runResult = this.runApkStartupRemediationWithOverrides(profile, overrides);
      runs.push(runResult);

      if (runResult.afterGate.passed) {
        stopReason = 'passed';
        break;
      }

      if (!runResult.improved) {
        stopReason = 'no-improvement';
        break;
      }
    }

    const finalRun = runs[runs.length - 1];
    if (finalRun === undefined) {
      const fallbackRun = this.runApkStartupRemediationWithOverrides(profile, overrides);
      return {
        profile,
        maxRuns,
        runs: [fallbackRun],
        finalRun: fallbackRun,
        stopReason: fallbackRun.afterGate.passed ? 'passed' : 'max-runs',
        converged: fallbackRun.afterGate.passed,
      };
    }

    return {
      profile,
      maxRuns,
      runs,
      finalRun,
      stopReason,
      converged: finalRun.afterGate.passed,
    };
  };

  override getApkStartupExecutionSummary = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
  ): ApkStartupExecutionSummary => {
    const runtimeState = this.getApkRuntimeState();
    const readyStatus = this.getApkHoudokuReadyStatus();
    const recommendedGate = this.runApkRecommendedStrictStartupGate(profile);

    return {
      profile,
      runtimeStateVersion: runtimeState.runtimeStateVersion,
      directoryStatus: readyStatus.directoryStatus,
      readyStatus,
      recommendedGatePassed: recommendedGate.passed,
      recommendedGateReasons: recommendedGate.reasons,
      suggestedNextAction: readyStatus.suggestedNextAction,
      actionHintsCount: runtimeState.actionHints.length,
      activeMappingCount: readyStatus.activeMappingCount,
      unsupportedApkCount: readyStatus.unsupportedApkCount,
      unneededApkCount: readyStatus.unneededApkCount,
    };
  };

  override runApkHoudokuTestReady = (
    options?: ApkHoudokuTestReadyOptions,
  ): ApkHoudokuTestReadyResult => {
    const profile = options?.profile || 'test';
    const maxRemediationRuns =
      Number.isFinite(options?.maxRemediationRuns) && (options?.maxRemediationRuns || 0) > 0
        ? Math.floor(options?.maxRemediationRuns || 1)
        : 3;

    const remediation = this.runApkStartupRemediationUntilStable({
      profile,
      overrides: options?.overrides,
      maxRuns: maxRemediationRuns,
    });

    const summary = this.getApkStartupExecutionSummary(profile);
    const finalGate = remediation.finalRun.afterGate;

    return {
      profile,
      maxRemediationRuns,
      usedOverrides: options?.overrides,
      remediation,
      summary,
      readyForHoudokuTest: finalGate.passed,
      reasons: finalGate.reasons,
    };
  };

  override getApkHoudokuLaunchModel = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuLaunchModel => {
    return this.getApkHoudokuLaunchModelWithOverrides({
      profile,
      previousRuntimeStateVersion,
      overrides: undefined,
    });
  };

  override getApkHoudokuLaunchModelWithOverrides = (
    options?: ApkHoudokuLaunchModelOptions,
  ): ApkHoudokuLaunchModel => {
    const profile = options?.profile || 'test';
    const previousRuntimeStateVersion = options?.previousRuntimeStateVersion;
    const overrides = options?.overrides;
    const uiModel = this.getApkUiModel(previousRuntimeStateVersion);
    const startupSummary = this.getApkStartupExecutionSummary(profile);
    const recommendedStrictGate = this._getStrictStartupRecommendationWithOverrides(
      profile,
      overrides,
    );
    const strictGate = this.runApkRuntimeStrictStartupGate(recommendedStrictGate.options);
    const remediationPlan = {
      ...this.getApkStartupRemediationPlan(profile),
      recommendation: recommendedStrictGate,
      strictGate,
    };

    return {
      profile,
      uiModel,
      startupSummary,
      recommendedStrictGate,
      remediationPlan,
      canRunHoudokuTest: strictGate.passed,
      blockerReasons: strictGate.reasons,
      usedOverrides: overrides,
    };
  };

  override getApkHoudokuTestingPreset = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
  ): ApkHoudokuTestingPreset => {
    if (profile === 'dev') {
      return {
        profile,
        overrides: {
          maintenanceOptions: {
            applyUnneededCleanup: false,
            unneededCleanupPolicy: 'unsupported-only',
            stabilizeMaxSteps: 1,
          },
          requireReadyLevel: 'warning',
          requireNoUnsupportedApks: false,
          requireNoUnneededApks: false,
        },
        notes: [
          'Developer testing preset favors speed and non-destructive behavior.',
          'Unsupported/unneeded APK constraints are relaxed for integration iteration.',
        ],
      };
    }

    if (profile === 'prod') {
      return {
        profile,
        overrides: {
          maintenanceOptions: {
            applyUnneededCleanup: false,
            unneededCleanupPolicy: 'all-unneeded',
            stabilizeMaxSteps: 2,
          },
          requireReadyLevel: 'ready',
          requireNoUnsupportedApks: true,
          requireNoUnneededApks: false,
        },
        notes: [
          'Production-like testing keeps readiness strict while remaining non-destructive by default.',
        ],
      };
    }

    return {
      profile: 'test',
      overrides: {
        maintenanceOptions: {
          applyUnneededCleanup: false,
          unneededCleanupPolicy: 'unsupported-only',
          stabilizeMaxSteps: 1,
        },
        requireReadyLevel: 'warning',
        requireNoUnsupportedApks: false,
        requireNoUnneededApks: false,
      },
      notes: [
        'Default test preset is designed for Houdoku integration testing without destructive cleanup.',
      ],
    };
  };

  override getApkHoudokuTestingModel = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuTestingModel => {
    return this.getApkHoudokuTestingModelWithOptions({
      profile,
      previousRuntimeStateVersion,
    });
  };

  override getApkHoudokuTestingModelWithOptions = (
    options?: ApkHoudokuTestingModelOptions,
  ): ApkHoudokuTestingModel => {
    const profile = options?.profile || 'test';
    const previousRuntimeStateVersion = options?.previousRuntimeStateVersion;
    const preset = this.getApkHoudokuTestingPreset(profile);
    const overrides = options?.overrides || preset.overrides;
    const maxRemediationRuns =
      Number.isFinite(options?.maxRemediationRuns) && (options?.maxRemediationRuns || 0) > 0
        ? Math.floor(options?.maxRemediationRuns || 1)
        : 2;

    const launchModel = this.getApkHoudokuLaunchModelWithOverrides({
      profile,
      previousRuntimeStateVersion,
      overrides,
    });
    const testReady = this.runApkHoudokuTestReady({
      profile,
      overrides,
      maxRemediationRuns,
    });

    return {
      profile,
      preset,
      launchModel,
      testReady,
    };
  };

  override getApkHoudokuIntegrationPlan = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuIntegrationPlan => {
    const testingModel = this.getApkHoudokuTestingModel(profile, previousRuntimeStateVersion);

    const steps = [
      {
        code: 'load-model',
        title: 'Load launch model',
        method: 'getApkHoudokuTestingModelWithOptions',
        description:
          'Fetch consolidated testing model at settings/open time to render current readiness and remediation context.',
        blocking: true,
      },
      {
        code: 'render-gate',
        title: 'Render gate state',
        method: 'getApkHoudokuLaunchModelWithOverrides',
        description:
          'Display canRunHoudokuTest, blockerReasons, and strict recommendation details in the launch/test panel.',
        blocking: true,
      },
      {
        code: 'run-ready',
        title: 'Run test-ready flow',
        method: 'runApkHoudokuTestReady',
        description:
          'On user action, execute bounded remediation and capture final readyForHoudokuTest plus reasons.',
        blocking: true,
      },
      {
        code: 'refresh-summary',
        title: 'Refresh summary',
        method: 'getApkStartupExecutionSummary',
        description:
          'Refresh lightweight startup summary after remediation or setting changes for status bar/badges.',
        blocking: false,
      },
      {
        code: 'manual-remediation',
        title: 'Show manual remediation',
        method: 'getApkStartupRemediationPlan',
        description:
          'If gate still fails, show ordered manual remediation steps mapped to backend methods.',
        blocking: false,
      },
    ];

    return {
      profile,
      testingModel,
      steps,
    };
  };

  private _executeHoudokuIntegrationStepByCode = (
    profile: ApkRuntimeStrictStartupProfile,
    stepCode: string,
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuIntegrationStepExecutionResult => {
    if (stepCode === 'load-model') {
      this.getApkHoudokuTestingModelWithOptions({
        profile,
        previousRuntimeStateVersion,
      });
      return {
        code: stepCode,
        method: 'getApkHoudokuTestingModelWithOptions',
        executed: true,
        note: 'Testing model loaded.',
      };
    }

    if (stepCode === 'render-gate') {
      this.getApkHoudokuLaunchModel(profile, previousRuntimeStateVersion);
      return {
        code: stepCode,
        method: 'getApkHoudokuLaunchModel',
        executed: true,
        note: 'Launch gate model refreshed.',
      };
    }

    if (stepCode === 'run-ready') {
      const preset = this.getApkHoudokuTestingPreset(profile);
      this.runApkHoudokuTestReady({
        profile,
        overrides: preset.overrides,
        maxRemediationRuns: 2,
      });
      return {
        code: stepCode,
        method: 'runApkHoudokuTestReady',
        executed: true,
        note: 'Test-ready flow executed with backend testing preset.',
      };
    }

    if (stepCode === 'refresh-summary') {
      this.getApkStartupExecutionSummary(profile);
      return {
        code: stepCode,
        method: 'getApkStartupExecutionSummary',
        executed: true,
        note: 'Startup summary refreshed.',
      };
    }

    if (stepCode === 'manual-remediation') {
      this.getApkStartupRemediationPlan(profile);
      return {
        code: stepCode,
        method: 'getApkStartupRemediationPlan',
        executed: true,
        note: 'Manual remediation plan loaded.',
      };
    }

    return {
      code: stepCode,
      method: 'unknown',
      executed: false,
      note: `No integration step handler is registered for '${stepCode}'.`,
    };
  };

  override runApkHoudokuIntegrationStep = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
    stepCode?: string,
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuIntegrationExecutionResult => {
    const normalizedStepCode = stepCode?.trim();
    const stepResults: ApkHoudokuIntegrationStepExecutionResult[] = [];

    if (normalizedStepCode !== undefined && normalizedStepCode.length > 0) {
      stepResults.push(
        this._executeHoudokuIntegrationStepByCode(
          profile,
          normalizedStepCode,
          previousRuntimeStateVersion,
        ),
      );
    }

    const launchModel = this.getApkHoudokuLaunchModel(profile, previousRuntimeStateVersion);

    return {
      profile,
      requestedStepCode: normalizedStepCode,
      stepResults,
      launchModel,
    };
  };

  override runApkHoudokuIntegrationPlan = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuIntegrationExecutionResult => {
    const plan = this.getApkHoudokuIntegrationPlan(profile, previousRuntimeStateVersion);
    const stepResults = plan.steps.map((step) =>
      this._executeHoudokuIntegrationStepByCode(profile, step.code, previousRuntimeStateVersion),
    );
    const launchModel = this.getApkHoudokuLaunchModel(profile, previousRuntimeStateVersion);

    return {
      profile,
      requestedStepCode: undefined,
      stepResults,
      launchModel,
    };
  };

  override getApkNextHoudokuIntegrationStep = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuNextIntegrationStep => {
    const plan = this.getApkHoudokuIntegrationPlan(profile, previousRuntimeStateVersion);
    const launchModel = plan.testingModel.launchModel;

    if (!launchModel.canRunHoudokuTest) {
      const runReadyStep = plan.steps.find((step) => step.code === 'run-ready');
      return {
        profile,
        canRunHoudokuTest: false,
        step: runReadyStep,
        reason:
          'Houdoku test gate is blocked; run test-ready flow to attempt automatic remediation.',
      };
    }

    const refreshSummaryStep = plan.steps.find((step) => step.code === 'refresh-summary');
    return {
      profile,
      canRunHoudokuTest: true,
      step: refreshSummaryStep,
      reason: 'Houdoku test gate is open; refresh summary to keep status and diagnostics current.',
    };
  };

  override runApkNextHoudokuIntegrationStep = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuNextIntegrationStepRunResult => {
    const nextStep = this.getApkNextHoudokuIntegrationStep(profile, previousRuntimeStateVersion);
    const execution = this.runApkHoudokuIntegrationStep(
      profile,
      nextStep.step?.code,
      previousRuntimeStateVersion,
    );

    return {
      profile,
      nextStep,
      execution,
    };
  };

  override getApkHoudokuIntegrationControllerModel = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuIntegrationControllerModel => {
    const plan = this.getApkHoudokuIntegrationPlan(profile, previousRuntimeStateVersion);
    const nextStep = this.getApkNextHoudokuIntegrationStep(profile, previousRuntimeStateVersion);

    return {
      profile,
      previousRuntimeStateVersion,
      plan,
      nextStep,
      canRunHoudokuTest: plan.testingModel.launchModel.canRunHoudokuTest,
      suggestedStepCode: nextStep.step?.code,
    };
  };

  override runApkHoudokuIntegrationControllerCycle = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuIntegrationControllerCycleResult => {
    const initialModel = this.getApkHoudokuIntegrationControllerModel(
      profile,
      previousRuntimeStateVersion,
    );
    const nextStepRun = this.runApkNextHoudokuIntegrationStep(profile, previousRuntimeStateVersion);
    const refreshedModel = this.getApkHoudokuIntegrationControllerModel(
      profile,
      previousRuntimeStateVersion,
    );

    return {
      profile,
      initialModel,
      nextStepRun,
      refreshedModel,
    };
  };

  private _getHoudokuIntegrationCommandSuggestionForStep = (
    profile: ApkRuntimeStrictStartupProfile,
    step: { code: string; method: string; blocking: boolean; description: string },
    previousRuntimeStateVersion?: string,
    isNextStep: boolean = false,
  ): ApkHoudokuIntegrationCommandSuggestion => {
    const preset = this.getApkHoudokuTestingPreset(profile);

    if (step.code === 'load-model') {
      return {
        stepCode: step.code,
        method: 'getApkHoudokuTestingModelWithOptions',
        argsJson: JSON.stringify([
          {
            profile,
            previousRuntimeStateVersion,
          },
        ]),
        blocking: step.blocking,
        description: step.description,
        isNextStep,
      };
    }

    if (step.code === 'render-gate') {
      return {
        stepCode: step.code,
        method: 'getApkHoudokuLaunchModel',
        argsJson: JSON.stringify([profile, previousRuntimeStateVersion]),
        blocking: step.blocking,
        description: step.description,
        isNextStep,
      };
    }

    if (step.code === 'run-ready') {
      return {
        stepCode: step.code,
        method: 'runApkHoudokuTestReady',
        argsJson: JSON.stringify([
          {
            profile,
            overrides: preset.overrides,
            maxRemediationRuns: 2,
          },
        ]),
        blocking: step.blocking,
        description: step.description,
        isNextStep,
      };
    }

    if (step.code === 'refresh-summary') {
      return {
        stepCode: step.code,
        method: 'getApkStartupExecutionSummary',
        argsJson: JSON.stringify([profile]),
        blocking: step.blocking,
        description: step.description,
        isNextStep,
      };
    }

    if (step.code === 'manual-remediation') {
      return {
        stepCode: step.code,
        method: 'getApkStartupRemediationPlan',
        argsJson: JSON.stringify([profile]),
        blocking: step.blocking,
        description: step.description,
        isNextStep,
      };
    }

    return {
      stepCode: step.code,
      method: step.method,
      argsJson: JSON.stringify([]),
      blocking: step.blocking,
      description: step.description,
      isNextStep,
    };
  };

  override getApkHoudokuIntegrationCommandSuggestions = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuIntegrationCommandSuggestionsResult => {
    const plan = this.getApkHoudokuIntegrationPlan(profile, previousRuntimeStateVersion);
    const nextStep = this.getApkNextHoudokuIntegrationStep(profile, previousRuntimeStateVersion);

    const suggestions = plan.steps.map((step) =>
      this._getHoudokuIntegrationCommandSuggestionForStep(
        profile,
        step,
        previousRuntimeStateVersion,
        nextStep.step?.code === step.code,
      ),
    );

    return {
      profile,
      previousRuntimeStateVersion,
      suggestions,
      nextStep,
    };
  };

  override preflightApkHoudokuIntegrationCommandSuggestion = (
    command?: ApkHoudokuIntegrationCommandSuggestion,
    profile: ApkRuntimeStrictStartupProfile = 'test',
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuIntegrationCommandPreflightResult => {
    const normalizedMethod = command?.method?.trim();
    const normalizedStepCode = command?.stepCode?.trim();

    if (
      command === undefined ||
      normalizedMethod === undefined ||
      normalizedMethod.length === 0 ||
      normalizedStepCode === undefined ||
      normalizedStepCode.length === 0
    ) {
      return {
        profile,
        command,
        normalizedMethod,
        normalizedStepCode,
        allowlisted: false,
        parsedArgsValid: false,
        parsedArgs: undefined,
        error: 'Command suggestion is missing required method or stepCode.',
      };
    }

    const available = this.getApkHoudokuIntegrationCommandSuggestions(
      profile,
      previousRuntimeStateVersion,
    ).suggestions;
    const allowlistedCommand = available.find(
      (entry) => entry.stepCode === normalizedStepCode && entry.method === normalizedMethod,
    );
    if (allowlistedCommand === undefined) {
      return {
        profile,
        command,
        normalizedMethod,
        normalizedStepCode,
        allowlisted: false,
        parsedArgsValid: false,
        parsedArgs: undefined,
        error: `Command '${normalizedMethod}' for step '${normalizedStepCode}' is not allowlisted.`,
      };
    }

    let parsedArgs: unknown[] = [];
    try {
      const parsed = JSON.parse(command.argsJson);
      if (!Array.isArray(parsed)) {
        return {
          profile,
          command,
          normalizedMethod,
          normalizedStepCode,
          allowlisted: true,
          parsedArgsValid: false,
          parsedArgs: undefined,
          error: 'argsJson must decode to an array.',
        };
      }
      parsedArgs = parsed;
    } catch {
      return {
        profile,
        command,
        normalizedMethod,
        normalizedStepCode,
        allowlisted: true,
        parsedArgsValid: false,
        parsedArgs: undefined,
        error: 'argsJson is not valid JSON.',
      };
    }

    return {
      profile,
      command,
      normalizedMethod,
      normalizedStepCode,
      allowlisted: true,
      parsedArgsValid: true,
      parsedArgs,
      error: undefined,
    };
  };

  override preflightApkHoudokuNextIntegrationCommandSuggestion = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuNextIntegrationCommandPreflightResult => {
    const suggestions = this.getApkHoudokuIntegrationCommandSuggestions(
      profile,
      previousRuntimeStateVersion,
    );
    const command = suggestions.suggestions.find((entry) => entry.isNextStep);
    const preflight = this.preflightApkHoudokuIntegrationCommandSuggestion(
      command,
      profile,
      previousRuntimeStateVersion,
    );

    return {
      profile,
      nextStep: suggestions.nextStep,
      command,
      preflight,
    };
  };

  override getApkHoudokuIntegrationCommandAuditBundle = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuIntegrationCommandAuditBundleResult => {
    const suggestions = this.getApkHoudokuIntegrationCommandSuggestions(
      profile,
      previousRuntimeStateVersion,
    );

    const entries = suggestions.suggestions.map((command) => {
      const preflight = this.preflightApkHoudokuIntegrationCommandSuggestion(
        command,
        profile,
        previousRuntimeStateVersion,
      );
      return {
        command,
        preflight,
        dispatchReady: preflight.allowlisted && preflight.parsedArgsValid,
      };
    });

    return {
      profile,
      previousRuntimeStateVersion,
      nextStep: suggestions.nextStep,
      entries,
    };
  };

  override getApkHoudokuNextIntegrationCommandAuditBundle = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuNextIntegrationCommandAuditBundleResult => {
    const nextPreflight = this.preflightApkHoudokuNextIntegrationCommandSuggestion(
      profile,
      previousRuntimeStateVersion,
    );

    return {
      profile,
      previousRuntimeStateVersion,
      nextStep: nextPreflight.nextStep,
      command: nextPreflight.command,
      preflight: nextPreflight.preflight,
      dispatchReady: nextPreflight.preflight.allowlisted && nextPreflight.preflight.parsedArgsValid,
    };
  };

  override runApkHoudokuNextIntegrationCommandTransaction = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuNextIntegrationCommandTransactionResult => {
    const beforeAudit = this.getApkHoudokuNextIntegrationCommandAuditBundle(
      profile,
      previousRuntimeStateVersion,
    );

    if (!beforeAudit.dispatchReady) {
      const afterAudit = this.getApkHoudokuNextIntegrationCommandAuditBundle(
        profile,
        previousRuntimeStateVersion,
      );
      return {
        profile,
        previousRuntimeStateVersion,
        beforeAudit,
        executed: false,
        execution: undefined,
        afterAudit,
        skippedReason: 'Next integration command is not dispatch-ready.',
      };
    }

    const execution = this.runApkHoudokuNextIntegrationCommandSuggestion(
      profile,
      previousRuntimeStateVersion,
    );
    const afterAudit = this.getApkHoudokuNextIntegrationCommandAuditBundle(
      profile,
      previousRuntimeStateVersion,
    );

    return {
      profile,
      previousRuntimeStateVersion,
      beforeAudit,
      executed: execution.execution.executed,
      execution,
      afterAudit,
      skippedReason: execution.execution.executed
        ? undefined
        : execution.execution.error || 'Next integration command execution failed.',
    };
  };

  override runApkHoudokuNextIntegrationCommandTransactions = (
    options?: ApkHoudokuNextIntegrationCommandTransactionLoopOptions,
  ): ApkHoudokuNextIntegrationCommandTransactionLoopResult => {
    const profile = options?.profile || 'test';
    const previousRuntimeStateVersion = options?.previousRuntimeStateVersion;
    const maxRuns =
      Number.isFinite(options?.maxRuns) && (options?.maxRuns || 0) > 0
        ? Math.floor(options?.maxRuns || 1)
        : 3;

    const runs: ApkHoudokuNextIntegrationCommandTransactionResult[] = [];
    let stopReason: ApkHoudokuNextIntegrationCommandTransactionLoopStopReason = 'reached-max-runs';
    let converged = false;

    for (let index = 0; index < maxRuns; index += 1) {
      const run = this.runApkHoudokuNextIntegrationCommandTransaction(
        profile,
        previousRuntimeStateVersion,
      );
      runs.push(run);

      if (!run.beforeAudit.dispatchReady) {
        stopReason = 'skipped-not-ready';
        break;
      }

      if (!run.executed) {
        stopReason = 'execution-failed';
        break;
      }

      const beforeStepCode = run.beforeAudit.command?.stepCode;
      const afterStepCode = run.afterAudit.command?.stepCode;
      const beforeReady = run.beforeAudit.dispatchReady;
      const afterReady = run.afterAudit.dispatchReady;

      if (beforeStepCode === afterStepCode && beforeReady === afterReady) {
        stopReason = 'converged';
        converged = true;
        break;
      }
    }

    const finalAudit =
      runs.length > 0
        ? runs[runs.length - 1].afterAudit
        : this.getApkHoudokuNextIntegrationCommandAuditBundle(profile, previousRuntimeStateVersion);

    return {
      profile,
      previousRuntimeStateVersion,
      maxRuns,
      runs,
      finalAudit,
      stopReason,
      converged,
    };
  };

  override runApkHoudokuNextIntegrationCommandTransactionsWithCompletionPolicy = (
    options?: ApkHoudokuIntegrationCompletionPolicyOptions,
  ): ApkHoudokuIntegrationCompletionPolicyResult => {
    const profile = options?.profile || 'test';
    const previousRuntimeStateVersion = options?.previousRuntimeStateVersion;
    const requiredStepCodes = (options?.requiredStepCodes || [])
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
    const stableNextStepRuns =
      Number.isFinite(options?.stableNextStepRuns) && (options?.stableNextStepRuns || 0) > 0
        ? Math.floor(options?.stableNextStepRuns || 1)
        : 1;

    const policy: ApkHoudokuIntegrationCompletionPolicy = {
      requiredStepCodes,
      requireDispatchReady: options?.requireDispatchReady !== false,
      requireCanRunHoudokuTest: options?.requireCanRunHoudokuTest !== false,
      stableNextStepRuns,
    };

    const loop = this.runApkHoudokuNextIntegrationCommandTransactions({
      profile,
      previousRuntimeStateVersion,
      maxRuns: options?.maxRuns,
    });

    const executedStepCodes = loop.runs
      .filter((run) => run.executed)
      .map((run) => run.execution?.command?.stepCode)
      .filter((value): value is string => value !== undefined);
    const completedRequiredStepCodes = policy.requiredStepCodes.filter((requiredCode) =>
      executedStepCodes.includes(requiredCode),
    );
    const missingRequiredStepCodes = policy.requiredStepCodes.filter(
      (requiredCode) => !completedRequiredStepCodes.includes(requiredCode),
    );

    const finalStepCode = loop.finalAudit.command?.stepCode;
    let stableNextStepRunsObserved = 0;
    for (let index = loop.runs.length - 1; index >= 0; index -= 1) {
      const run = loop.runs[index];
      const runStepCode = run.afterAudit.command?.stepCode;
      if (runStepCode !== finalStepCode) {
        break;
      }
      stableNextStepRunsObserved += 1;
    }

    const reasons: string[] = [];
    if (policy.requireDispatchReady && !loop.finalAudit.dispatchReady) {
      reasons.push('Final next-command audit is not dispatch-ready.');
    }
    if (policy.requireCanRunHoudokuTest && !loop.finalAudit.nextStep.canRunHoudokuTest) {
      reasons.push('Final next-step state cannot run Houdoku test.');
    }
    if (missingRequiredStepCodes.length > 0) {
      reasons.push(`Required step codes not completed: ${missingRequiredStepCodes.join(', ')}.`);
    }
    if (stableNextStepRunsObserved < policy.stableNextStepRuns) {
      reasons.push(
        `Stable next-step runs observed ${stableNextStepRunsObserved} is below required ${policy.stableNextStepRuns}.`,
      );
    }

    return {
      profile,
      previousRuntimeStateVersion,
      policy,
      loop,
      completed: reasons.length === 0,
      reasons,
      completedRequiredStepCodes,
      missingRequiredStepCodes,
      stableNextStepRunsObserved,
    };
  };

  override getApkHoudokuIntegrationCompletionPolicyPreset = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
  ): ApkHoudokuIntegrationCompletionPolicyPreset => {
    if (profile === 'dev') {
      return {
        profile,
        maxRuns: 2,
        policy: {
          requiredStepCodes: [],
          requireDispatchReady: false,
          requireCanRunHoudokuTest: false,
          stableNextStepRuns: 1,
        },
        notes: [
          'Developer preset favors fast feedback over strict completion gating.',
          'Useful for rapid UI/IPC wiring iterations.',
        ],
      };
    }

    if (profile === 'prod') {
      return {
        profile,
        maxRuns: 5,
        policy: {
          requiredStepCodes: ['refresh-summary'],
          requireDispatchReady: true,
          requireCanRunHoudokuTest: true,
          stableNextStepRuns: 2,
        },
        notes: [
          'Production preset requires dispatch/test readiness and stronger step stability.',
          'Recommended for release and operator confidence checks.',
        ],
      };
    }

    return {
      profile: 'test',
      maxRuns: 3,
      policy: {
        requiredStepCodes: ['refresh-summary'],
        requireDispatchReady: true,
        requireCanRunHoudokuTest: true,
        stableNextStepRuns: 1,
      },
      notes: [
        'Test preset balances deterministic completion checks with bounded execution.',
        'Recommended default for Houdoku integration verification.',
      ],
    };
  };

  override runApkHoudokuIntegrationCompletionPolicyPreset = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuIntegrationCompletionPolicyResult => {
    const preset = this.getApkHoudokuIntegrationCompletionPolicyPreset(profile);

    return this.runApkHoudokuNextIntegrationCommandTransactionsWithCompletionPolicy({
      profile: preset.profile,
      previousRuntimeStateVersion,
      maxRuns: preset.maxRuns,
      requiredStepCodes: preset.policy.requiredStepCodes,
      requireDispatchReady: preset.policy.requireDispatchReady,
      requireCanRunHoudokuTest: preset.policy.requireCanRunHoudokuTest,
      stableNextStepRuns: preset.policy.stableNextStepRuns,
    });
  };

  override getApkHoudokuIntegrationCompletionPolicyPresetRecommendation = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuIntegrationCompletionPolicyPresetRecommendation => {
    const runtimeQuickStatus = this.getApkRuntimeQuickStatus(previousRuntimeStateVersion);
    const nextAudit = this.getApkHoudokuNextIntegrationCommandAuditBundle(
      'test',
      previousRuntimeStateVersion,
    );
    const recommendedStrictGate = this.runApkRecommendedStrictStartupGate('test');

    let recommendedProfile: ApkRuntimeStrictStartupProfile = 'test';
    const reasons: string[] = [];

    if (!nextAudit.dispatchReady || !nextAudit.nextStep.canRunHoudokuTest) {
      recommendedProfile = 'dev';
      reasons.push('Dispatch/test gate is not fully ready; use dev preset for fast iteration.');
    } else if (runtimeQuickStatus.hasBlockingErrors || !recommendedStrictGate.passed) {
      recommendedProfile = 'test';
      reasons.push('Runtime has non-ideal signals; keep balanced test preset for verification.');
    } else {
      recommendedProfile = 'prod';
      reasons.push(
        'Dispatch/test readiness is strong and strict gate is passing; use prod preset.',
      );
    }

    const recommendedPreset =
      this.getApkHoudokuIntegrationCompletionPolicyPreset(recommendedProfile);

    return {
      previousRuntimeStateVersion,
      recommendedProfile,
      recommendedPreset,
      reasons,
      overrideOptions: {
        profile: recommendedPreset.profile,
        previousRuntimeStateVersion,
        maxRuns: recommendedPreset.maxRuns,
        requiredStepCodes: recommendedPreset.policy.requiredStepCodes,
        requireDispatchReady: recommendedPreset.policy.requireDispatchReady,
        requireCanRunHoudokuTest: recommendedPreset.policy.requireCanRunHoudokuTest,
        stableNextStepRuns: recommendedPreset.policy.stableNextStepRuns,
      },
      signals: {
        dispatchReady: nextAudit.dispatchReady,
        canRunHoudokuTest: nextAudit.nextStep.canRunHoudokuTest,
        hasBlockingErrors: runtimeQuickStatus.hasBlockingErrors,
        recommendedStrictGatePassed: recommendedStrictGate.passed,
      },
    };
  };

  override runApkHoudokuIntegrationCompletionPolicyPresetRecommendation = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuIntegrationCompletionPolicyPresetRunResult => {
    const recommendation = this.getApkHoudokuIntegrationCompletionPolicyPresetRecommendation(
      previousRuntimeStateVersion,
    );
    const result = this.runApkHoudokuNextIntegrationCommandTransactionsWithCompletionPolicy(
      recommendation.overrideOptions,
    );

    return {
      recommendation,
      result,
    };
  };

  override runApkHoudokuIntegrationAutopilotSession = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuIntegrationAutopilotSessionResult => {
    const run = this.runApkHoudokuIntegrationCompletionPolicyPresetRecommendation(
      previousRuntimeStateVersion,
    );

    let status: ApkHoudokuIntegrationAutopilotSessionResult['status'] = 'incomplete';
    if (run.result.completed) {
      status = 'completed';
    } else if (run.result.reasons.length > 0) {
      status = 'needs-attention';
    }

    const summary = run.result.completed
      ? `Autopilot completed with '${run.recommendation.recommendedProfile}' preset.`
      : `Autopilot incomplete with '${run.recommendation.recommendedProfile}' preset.`;

    const suggestedNextAction = run.result.completed
      ? 'none'
      : run.result.missingRequiredStepCodes.length > 0
        ? 'manual-remediation'
        : 'run-ready';

    return {
      previousRuntimeStateVersion,
      recommendation: run.recommendation,
      run,
      status,
      summary,
      suggestedNextAction,
    };
  };

  override getApkHoudokuIntegrationAutopilotQuickStatus = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuIntegrationAutopilotQuickStatus => {
    const digest = this.getApkRuntimeDigest();
    const runtimeQuickStatus = this.getApkRuntimeQuickStatus(previousRuntimeStateVersion);
    const recommendation = this.getApkHoudokuIntegrationCompletionPolicyPresetRecommendation(
      previousRuntimeStateVersion,
    );

    let status: ApkHoudokuIntegrationAutopilotQuickStatus['status'] = 'incomplete';
    let suggestedNextAction = 'run-ready';
    let reason = 'Autopilot quick status indicates additional integration actions are available.';

    if (runtimeQuickStatus.hasBlockingErrors) {
      status = 'needs-attention';
      suggestedNextAction = 'manual-remediation';
      reason = 'Runtime quick status has blocking errors that require attention.';
    } else if (
      recommendation.signals.dispatchReady &&
      recommendation.signals.canRunHoudokuTest &&
      recommendation.recommendedProfile !== 'dev'
    ) {
      status = 'completed';
      suggestedNextAction = 'none';
      reason = 'Dispatch and test-readiness signals are healthy for current runtime state.';
    }

    return {
      previousRuntimeStateVersion,
      runtimeStateVersion: digest.runtimeStateVersion,
      changed: runtimeQuickStatus.changed,
      runtimeQuickStatus,
      status,
      recommendedProfile: recommendation.recommendedProfile,
      suggestedNextAction,
      reason,
    };
  };

  override getApkHoudokuTestingEntryModel = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuTestingEntryModel => {
    const runtimeDigest = this.getApkRuntimeDigest();
    const runtimeQuickStatus = this.getApkRuntimeQuickStatus(previousRuntimeStateVersion);
    const autopilotQuickStatus = this.getApkHoudokuTestingAutopilotQuickStatus(
      previousRuntimeStateVersion,
    );
    const testingPreset = this.getApkHoudokuTestingPreset('test');
    const completionRecommendation = this.getApkHoudokuTestingCompletionPolicyPresetRecommendation(
      previousRuntimeStateVersion,
    );

    const canStartInteractiveTest =
      autopilotQuickStatus.status === 'completed' ||
      (completionRecommendation.signals.dispatchReady &&
        completionRecommendation.signals.canRunInteractiveTest);
    const suggestedPrimaryAction = canStartInteractiveTest
      ? 'start-houdoku-test'
      : autopilotQuickStatus.suggestedNextAction;

    return {
      previousRuntimeStateVersion,
      runtimeDigest,
      runtimeQuickStatus,
      autopilotQuickStatus,
      testingPreset,
      completionRecommendation,
      canStartInteractiveTest,
      suggestedPrimaryAction,
    };
  };

  override runApkHoudokuTestingPrimaryAction = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuTestingPrimaryActionRunResult => {
    const entryModel = this.getApkHoudokuTestingEntryModel(previousRuntimeStateVersion);
    const action = entryModel.suggestedPrimaryAction;

    if (action === 'start-houdoku-test' || action === 'run-ready') {
      const testReady = this.runApkHoudokuTestReady({
        profile: 'test',
        overrides: entryModel.testingPreset.overrides,
        maxRemediationRuns: 2,
      });
      return {
        previousRuntimeStateVersion,
        action,
        performed: true,
        reason: testReady.readyForHoudokuTest
          ? 'Primary action executed and Houdoku test is ready.'
          : 'Primary action executed but Houdoku test readiness is still blocked.',
        entryModel,
        testReady,
        remediationPlan: undefined,
      };
    }

    if (action === 'manual-remediation') {
      const remediationPlan = this.getApkStartupRemediationPlan('test');
      return {
        previousRuntimeStateVersion,
        action,
        performed: true,
        reason: 'Primary action executed and remediation plan loaded.',
        entryModel,
        testReady: undefined,
        remediationPlan,
      };
    }

    if (action === 'none') {
      return {
        previousRuntimeStateVersion,
        action,
        performed: false,
        reason: 'No primary action required.',
        entryModel,
        testReady: undefined,
        remediationPlan: undefined,
      };
    }

    return {
      previousRuntimeStateVersion,
      action,
      performed: false,
      reason: `No primary action handler is registered for '${action}'.`,
      entryModel,
      testReady: undefined,
      remediationPlan: undefined,
    };
  };

  override runApkHoudokuTestingSession = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuTestingSessionRunResult => {
    const beforeEntryModel = this.getApkHoudokuTestingEntryModel(previousRuntimeStateVersion);
    const primaryActionRun = this.runApkHoudokuTestingPrimaryAction(previousRuntimeStateVersion);
    const afterEntryModel = this.getApkHoudokuTestingEntryModel(
      beforeEntryModel.runtimeDigest.runtimeStateVersion,
    );

    const completed =
      afterEntryModel.canStartInteractiveTest &&
      (afterEntryModel.suggestedPrimaryAction === 'start-houdoku-test' ||
        afterEntryModel.suggestedPrimaryAction === 'none');
    const reason = completed
      ? 'Testing session advanced to interactive-test-ready state.'
      : 'Testing session executed, but additional actions are still required.';

    return {
      previousRuntimeStateVersion,
      beforeEntryModel,
      primaryActionRun,
      afterEntryModel,
      completed,
      reason,
    };
  };

  override runApkHoudokuTestingSessionLoop = (
    options?: ApkHoudokuTestingSessionLoopOptions,
  ): ApkHoudokuTestingSessionLoopResult => {
    const previousRuntimeStateVersion = options?.previousRuntimeStateVersion;
    const maxRuns =
      Number.isFinite(options?.maxRuns) && (options?.maxRuns || 0) > 0
        ? Math.floor(options?.maxRuns || 1)
        : 3;
    const stableCompletionRuns =
      Number.isFinite(options?.stableCompletionRuns) && (options?.stableCompletionRuns || 0) > 0
        ? Math.floor(options?.stableCompletionRuns || 1)
        : 1;

    const runs: ApkHoudokuTestingSessionRunResult[] = [];
    let nextPreviousRuntimeStateVersion = previousRuntimeStateVersion;
    let stopReason: ApkHoudokuTestingSessionLoopStopReason = 'max-runs';
    let completedRunCount = 0;

    for (let index = 0; index < maxRuns; index += 1) {
      const sessionRun = this.runApkHoudokuTestingSession(nextPreviousRuntimeStateVersion);
      runs.push(sessionRun);
      nextPreviousRuntimeStateVersion =
        sessionRun.afterEntryModel.runtimeDigest.runtimeStateVersion;

      if (sessionRun.completed) {
        completedRunCount += 1;
      } else {
        completedRunCount = 0;
      }

      if (completedRunCount >= stableCompletionRuns) {
        stopReason = 'completed';
        break;
      }
    }

    const finalSession =
      runs[runs.length - 1] || this.runApkHoudokuTestingSession(previousRuntimeStateVersion);
    const completed = stopReason === 'completed';

    return {
      previousRuntimeStateVersion,
      maxRuns,
      stableCompletionRuns,
      runs,
      finalSession,
      completed,
      completedRunCount,
      stopReason,
      reason: completed
        ? 'Testing session loop reached a stable interactive-test-ready state.'
        : 'Testing session loop reached max runs before stable completion.',
    };
  };

  override getApkHoudokuTestingControllerModel = (
    options?: ApkHoudokuTestingControllerModelOptions,
  ): ApkHoudokuTestingControllerModel => {
    const previousRuntimeStateVersion = options?.previousRuntimeStateVersion;
    const maxRuns =
      Number.isFinite(options?.maxRuns) && (options?.maxRuns || 0) > 0
        ? Math.floor(options?.maxRuns || 1)
        : 3;
    const stableCompletionRuns =
      Number.isFinite(options?.stableCompletionRuns) && (options?.stableCompletionRuns || 0) > 0
        ? Math.floor(options?.stableCompletionRuns || 1)
        : 1;
    const entryModel = this.getApkHoudokuTestingEntryModel(previousRuntimeStateVersion);
    const canRunInteractiveTest = entryModel.canStartInteractiveTest;
    const status = canRunInteractiveTest ? 'ready' : 'needs-action';

    return {
      previousRuntimeStateVersion,
      entryModel,
      canRunInteractiveTest,
      suggestedPrimaryAction: entryModel.suggestedPrimaryAction,
      suggestedLoopOptions: {
        maxRuns,
        stableCompletionRuns,
      },
      status,
      reason: canRunInteractiveTest
        ? 'Controller model indicates interactive testing can start.'
        : 'Controller model indicates additional test preparation actions are required.',
    };
  };

  override runApkHoudokuTestingControllerCycle = (
    options?: ApkHoudokuTestingControllerModelOptions,
  ): ApkHoudokuTestingControllerCycleResult => {
    const initialModel = this.getApkHoudokuTestingControllerModel(options);
    const loop = this.runApkHoudokuTestingSessionLoop({
      previousRuntimeStateVersion: initialModel.entryModel.runtimeDigest.runtimeStateVersion,
      maxRuns: initialModel.suggestedLoopOptions.maxRuns,
      stableCompletionRuns: initialModel.suggestedLoopOptions.stableCompletionRuns,
    });
    const refreshedModel = this.getApkHoudokuTestingControllerModel({
      previousRuntimeStateVersion:
        loop.finalSession.afterEntryModel.runtimeDigest.runtimeStateVersion,
      maxRuns: initialModel.suggestedLoopOptions.maxRuns,
      stableCompletionRuns: initialModel.suggestedLoopOptions.stableCompletionRuns,
    });
    const completed = loop.completed && refreshedModel.canRunInteractiveTest;

    return {
      previousRuntimeStateVersion: options?.previousRuntimeStateVersion,
      initialModel,
      loop,
      refreshedModel,
      completed,
      suggestedNextAction: completed ? 'none' : refreshedModel.suggestedPrimaryAction,
      reason: completed
        ? 'Testing controller cycle completed and interactive testing is ready.'
        : 'Testing controller cycle finished but additional primary actions remain.',
    };
  };

  override runApkHoudokuTestingAutopilot = (
    options?: ApkHoudokuTestingAutopilotOptions,
  ): ApkHoudokuTestingAutopilotResult => {
    const controllerModel = this.getApkHoudokuTestingControllerModel(options);
    const controllerCycle = this.runApkHoudokuTestingControllerCycle(options);
    const launchModel = this.getApkHoudokuLaunchModelWithOverrides({
      profile: 'test',
      previousRuntimeStateVersion:
        controllerCycle.refreshedModel.entryModel.runtimeDigest.runtimeStateVersion,
      overrides: controllerCycle.refreshedModel.entryModel.testingPreset.overrides,
    });
    const completed = controllerCycle.completed;

    return {
      previousRuntimeStateVersion: options?.previousRuntimeStateVersion,
      controllerModel,
      controllerCycle,
      launchModel,
      status: completed ? 'completed' : 'incomplete',
      completed,
      suggestedNextAction: completed ? 'none' : controllerCycle.suggestedNextAction,
      reason: completed
        ? 'Testing autopilot completed with interactive testing ready.'
        : 'Testing autopilot ran, but further primary actions are still required.',
    };
  };

  override getApkHoudokuTestingCommandSuggestions = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuTestingCommandSuggestionsResult => {
    const controllerModel = this.getApkHoudokuTestingControllerModel({
      previousRuntimeStateVersion,
    });

    const suggestions: ApkHoudokuTestingCommandSuggestion[] = [
      {
        stepCode: 'refresh-entry',
        method: 'getApkHoudokuTestingEntryModel',
        argsJson: JSON.stringify([previousRuntimeStateVersion]),
        description: 'Refresh testing entry model for current runtime state.',
        isNextStep: controllerModel.canRunInteractiveTest,
      },
      {
        stepCode: 'run-primary-action',
        method: 'runApkHoudokuTestingPrimaryAction',
        argsJson: JSON.stringify([previousRuntimeStateVersion]),
        description: 'Execute suggested primary testing action from entry model.',
        isNextStep: !controllerModel.canRunInteractiveTest,
      },
      {
        stepCode: 'run-autopilot',
        method: 'runApkHoudokuTestingAutopilot',
        argsJson: JSON.stringify([
          {
            previousRuntimeStateVersion,
            maxRuns: controllerModel.suggestedLoopOptions.maxRuns,
            stableCompletionRuns: controllerModel.suggestedLoopOptions.stableCompletionRuns,
          },
        ]),
        description: 'Run testing autopilot cycle with controller-recommended loop options.',
        isNextStep: false,
      },
    ];

    return {
      previousRuntimeStateVersion,
      suggestions,
      controllerModel,
    };
  };

  override preflightApkHoudokuTestingCommandSuggestion = (
    command?: ApkHoudokuTestingCommandSuggestion,
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuTestingCommandPreflightResult => {
    const normalizedMethod = command?.method?.trim();
    const normalizedStepCode = command?.stepCode?.trim();

    if (
      command === undefined ||
      normalizedMethod === undefined ||
      normalizedMethod.length === 0 ||
      normalizedStepCode === undefined ||
      normalizedStepCode.length === 0
    ) {
      return {
        previousRuntimeStateVersion,
        command,
        normalizedMethod,
        normalizedStepCode,
        allowlisted: false,
        parsedArgsValid: false,
        parsedArgs: undefined,
        error: 'Command suggestion is missing required method or stepCode.',
      };
    }

    const available = this.getApkHoudokuTestingCommandSuggestions(
      previousRuntimeStateVersion,
    ).suggestions;
    const allowlistedCommand = available.find(
      (entry) => entry.stepCode === normalizedStepCode && entry.method === normalizedMethod,
    );
    if (allowlistedCommand === undefined) {
      return {
        previousRuntimeStateVersion,
        command,
        normalizedMethod,
        normalizedStepCode,
        allowlisted: false,
        parsedArgsValid: false,
        parsedArgs: undefined,
        error: `Command '${normalizedMethod}' for step '${normalizedStepCode}' is not allowlisted.`,
      };
    }

    let parsedArgs: unknown[] = [];
    try {
      const parsed = JSON.parse(command.argsJson);
      if (!Array.isArray(parsed)) {
        return {
          previousRuntimeStateVersion,
          command,
          normalizedMethod,
          normalizedStepCode,
          allowlisted: true,
          parsedArgsValid: false,
          parsedArgs: undefined,
          error: 'argsJson must decode to an array.',
        };
      }
      parsedArgs = parsed;
    } catch {
      return {
        previousRuntimeStateVersion,
        command,
        normalizedMethod,
        normalizedStepCode,
        allowlisted: true,
        parsedArgsValid: false,
        parsedArgs: undefined,
        error: 'argsJson is not valid JSON.',
      };
    }

    return {
      previousRuntimeStateVersion,
      command,
      normalizedMethod,
      normalizedStepCode,
      allowlisted: true,
      parsedArgsValid: true,
      parsedArgs,
      error: undefined,
    };
  };

  private _executeAllowlistedHoudokuTestingCommand = (method: string, args: unknown[]): void => {
    if (method === 'getApkHoudokuTestingEntryModel') {
      this.getApkHoudokuTestingEntryModel(...(args as [string?]));
      return;
    }

    if (method === 'runApkHoudokuTestingPrimaryAction') {
      this.runApkHoudokuTestingPrimaryAction(...(args as [string?]));
      return;
    }

    if (method === 'runApkHoudokuTestingAutopilot') {
      this.runApkHoudokuTestingAutopilot(...(args as [ApkHoudokuTestingAutopilotOptions?]));
      return;
    }

    throw new Error(`Method '${method}' is not allowlisted for testing command dispatch.`);
  };

  override runApkHoudokuTestingCommandSuggestion = (
    command?: ApkHoudokuTestingCommandSuggestion,
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuTestingCommandExecutionResult => {
    const preflight = this.preflightApkHoudokuTestingCommandSuggestion(
      command,
      previousRuntimeStateVersion,
    );

    if (
      !preflight.allowlisted ||
      !preflight.parsedArgsValid ||
      preflight.normalizedMethod === undefined
    ) {
      return {
        previousRuntimeStateVersion,
        command,
        allowlisted: preflight.allowlisted,
        parsedArgsValid: preflight.parsedArgsValid,
        executed: false,
        error: preflight.error,
        autopilot: this.runApkHoudokuTestingAutopilot({
          previousRuntimeStateVersion,
        }),
      };
    }

    try {
      this._executeAllowlistedHoudokuTestingCommand(
        preflight.normalizedMethod,
        preflight.parsedArgs || [],
      );
      return {
        previousRuntimeStateVersion,
        command,
        allowlisted: true,
        parsedArgsValid: true,
        executed: true,
        error: undefined,
        autopilot: this.runApkHoudokuTestingAutopilot({
          previousRuntimeStateVersion,
        }),
      };
    } catch (error) {
      return {
        previousRuntimeStateVersion,
        command,
        allowlisted: true,
        parsedArgsValid: true,
        executed: false,
        error: error instanceof Error ? error.message : 'Unknown command execution error.',
        autopilot: this.runApkHoudokuTestingAutopilot({
          previousRuntimeStateVersion,
        }),
      };
    }
  };

  override runApkHoudokuNextTestingCommandSuggestion = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuNextTestingCommandExecutionResult => {
    const suggestions = this.getApkHoudokuTestingCommandSuggestions(previousRuntimeStateVersion);
    const command = suggestions.suggestions.find((entry) => entry.isNextStep);
    const execution = this.runApkHoudokuTestingCommandSuggestion(
      command,
      previousRuntimeStateVersion,
    );

    return {
      previousRuntimeStateVersion,
      command,
      execution,
    };
  };

  override preflightApkHoudokuNextTestingCommandSuggestion = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuNextTestingCommandPreflightResult => {
    const suggestions = this.getApkHoudokuTestingCommandSuggestions(previousRuntimeStateVersion);
    const command = suggestions.suggestions.find((entry) => entry.isNextStep);
    const preflight = this.preflightApkHoudokuTestingCommandSuggestion(
      command,
      previousRuntimeStateVersion,
    );

    return {
      previousRuntimeStateVersion,
      command,
      preflight,
    };
  };

  override getApkHoudokuTestingCommandAuditBundle = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuTestingCommandAuditBundleResult => {
    const suggestions = this.getApkHoudokuTestingCommandSuggestions(previousRuntimeStateVersion);

    const entries = suggestions.suggestions.map((command) => {
      const preflight = this.preflightApkHoudokuTestingCommandSuggestion(
        command,
        previousRuntimeStateVersion,
      );
      return {
        command,
        preflight,
        dispatchReady: preflight.allowlisted && preflight.parsedArgsValid,
      };
    });

    return {
      previousRuntimeStateVersion,
      entries,
    };
  };

  override getApkHoudokuNextTestingCommandAuditBundle = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuNextTestingCommandAuditBundleResult => {
    const nextPreflight = this.preflightApkHoudokuNextTestingCommandSuggestion(
      previousRuntimeStateVersion,
    );

    return {
      previousRuntimeStateVersion,
      command: nextPreflight.command,
      preflight: nextPreflight.preflight,
      dispatchReady: nextPreflight.preflight.allowlisted && nextPreflight.preflight.parsedArgsValid,
    };
  };

  override runApkHoudokuNextTestingCommandTransaction = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuNextTestingCommandTransactionResult => {
    const beforeAudit = this.getApkHoudokuNextTestingCommandAuditBundle(
      previousRuntimeStateVersion,
    );

    if (!beforeAudit.dispatchReady) {
      const afterAudit = this.getApkHoudokuNextTestingCommandAuditBundle(
        previousRuntimeStateVersion,
      );
      return {
        previousRuntimeStateVersion,
        beforeAudit,
        executed: false,
        execution: undefined,
        afterAudit,
        skippedReason: 'Next testing command is not dispatch-ready.',
      };
    }

    const execution = this.runApkHoudokuNextTestingCommandSuggestion(previousRuntimeStateVersion);
    const afterAudit = this.getApkHoudokuNextTestingCommandAuditBundle(previousRuntimeStateVersion);

    return {
      previousRuntimeStateVersion,
      beforeAudit,
      executed: execution.execution.executed,
      execution,
      afterAudit,
      skippedReason: execution.execution.executed
        ? undefined
        : execution.execution.error || 'Next testing command execution failed.',
    };
  };

  override runApkHoudokuNextTestingCommandTransactions = (
    options?: ApkHoudokuNextTestingCommandTransactionLoopOptions,
  ): ApkHoudokuNextTestingCommandTransactionLoopResult => {
    const previousRuntimeStateVersion = options?.previousRuntimeStateVersion;
    const maxRuns =
      Number.isFinite(options?.maxRuns) && (options?.maxRuns || 0) > 0
        ? Math.floor(options?.maxRuns || 1)
        : 3;

    const runs: ApkHoudokuNextTestingCommandTransactionResult[] = [];
    let stopReason: ApkHoudokuNextTestingCommandTransactionLoopStopReason = 'reached-max-runs';
    let converged = false;

    for (let index = 0; index < maxRuns; index += 1) {
      const run = this.runApkHoudokuNextTestingCommandTransaction(previousRuntimeStateVersion);
      runs.push(run);

      if (!run.beforeAudit.dispatchReady) {
        stopReason = 'skipped-not-ready';
        break;
      }

      if (!run.executed) {
        stopReason = 'execution-failed';
        break;
      }

      const beforeStepCode = run.beforeAudit.command?.stepCode;
      const afterStepCode = run.afterAudit.command?.stepCode;
      const beforeReady = run.beforeAudit.dispatchReady;
      const afterReady = run.afterAudit.dispatchReady;

      if (beforeStepCode === afterStepCode && beforeReady === afterReady) {
        stopReason = 'converged';
        converged = true;
        break;
      }
    }

    const finalAudit =
      runs.length > 0
        ? runs[runs.length - 1].afterAudit
        : this.getApkHoudokuNextTestingCommandAuditBundle(previousRuntimeStateVersion);

    return {
      previousRuntimeStateVersion,
      maxRuns,
      runs,
      finalAudit,
      stopReason,
      converged,
    };
  };

  override runApkHoudokuNextTestingCommandTransactionsWithCompletionPolicy = (
    options?: ApkHoudokuTestingCompletionPolicyOptions,
  ): ApkHoudokuTestingCompletionPolicyResult => {
    const profile = options?.profile || 'test';
    const previousRuntimeStateVersion = options?.previousRuntimeStateVersion;
    const requiredStepCodes = (options?.requiredStepCodes || [])
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
    const stableNextStepRuns =
      Number.isFinite(options?.stableNextStepRuns) && (options?.stableNextStepRuns || 0) > 0
        ? Math.floor(options?.stableNextStepRuns || 1)
        : 1;

    const policy: ApkHoudokuTestingCompletionPolicy = {
      requiredStepCodes,
      requireDispatchReady: options?.requireDispatchReady !== false,
      requireInteractiveTestReady: options?.requireInteractiveTestReady !== false,
      stableNextStepRuns,
    };

    const loop = this.runApkHoudokuNextTestingCommandTransactions({
      previousRuntimeStateVersion,
      maxRuns: options?.maxRuns,
    });

    const executedStepCodes = loop.runs
      .filter((run) => run.executed)
      .map((run) => run.execution?.command?.stepCode)
      .filter((value): value is string => value !== undefined);
    const completedRequiredStepCodes = policy.requiredStepCodes.filter((requiredCode) =>
      executedStepCodes.includes(requiredCode),
    );
    const missingRequiredStepCodes = policy.requiredStepCodes.filter(
      (requiredCode) => !completedRequiredStepCodes.includes(requiredCode),
    );

    const finalStepCode = loop.finalAudit.command?.stepCode;
    let stableNextStepRunsObserved = 0;
    for (let index = loop.runs.length - 1; index >= 0; index -= 1) {
      const run = loop.runs[index];
      const runStepCode = run.afterAudit.command?.stepCode;
      if (runStepCode !== finalStepCode) {
        break;
      }
      stableNextStepRunsObserved += 1;
    }

    const finalControllerModel = this.getApkHoudokuTestingControllerModel({
      previousRuntimeStateVersion,
    });

    const reasons: string[] = [];
    if (policy.requireDispatchReady && !loop.finalAudit.dispatchReady) {
      reasons.push('Final next-testing-command audit is not dispatch-ready.');
    }
    if (policy.requireInteractiveTestReady && !finalControllerModel.canRunInteractiveTest) {
      reasons.push('Final testing controller state cannot run interactive test.');
    }
    if (missingRequiredStepCodes.length > 0) {
      reasons.push(
        `Required testing step codes not completed: ${missingRequiredStepCodes.join(', ')}.`,
      );
    }
    if (stableNextStepRunsObserved < policy.stableNextStepRuns) {
      reasons.push(
        `Stable next-testing-step runs observed ${stableNextStepRunsObserved} is below required ${policy.stableNextStepRuns}.`,
      );
    }

    return {
      profile,
      previousRuntimeStateVersion,
      policy,
      loop,
      finalControllerModel,
      completed: reasons.length === 0,
      reasons,
      completedRequiredStepCodes,
      missingRequiredStepCodes,
      stableNextStepRunsObserved,
    };
  };

  override getApkHoudokuTestingCompletionPolicyPreset = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
  ): ApkHoudokuTestingCompletionPolicyPreset => {
    if (profile === 'dev') {
      return {
        profile,
        maxRuns: 2,
        policy: {
          requiredStepCodes: [],
          requireDispatchReady: false,
          requireInteractiveTestReady: false,
          stableNextStepRuns: 1,
        },
        notes: [
          'Developer preset favors fast iteration for testing command wiring.',
          'Use when validating IPC/UX flow before strict readiness checks.',
        ],
      };
    }

    if (profile === 'prod') {
      return {
        profile,
        maxRuns: 5,
        policy: {
          requiredStepCodes: ['refresh-entry'],
          requireDispatchReady: true,
          requireInteractiveTestReady: true,
          stableNextStepRuns: 2,
        },
        notes: [
          'Production preset requires dispatch readiness and stable interactive-test readiness.',
          'Recommended for operator confidence before broad rollout.',
        ],
      };
    }

    return {
      profile: 'test',
      maxRuns: 3,
      policy: {
        requiredStepCodes: ['refresh-entry'],
        requireDispatchReady: true,
        requireInteractiveTestReady: true,
        stableNextStepRuns: 1,
      },
      notes: [
        'Test preset balances deterministic completion checks with bounded execution.',
        'Recommended default for Houdoku testing command verification.',
      ],
    };
  };

  override runApkHoudokuTestingCompletionPolicyPreset = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuTestingCompletionPolicyResult => {
    const preset = this.getApkHoudokuTestingCompletionPolicyPreset(profile);

    return this.runApkHoudokuNextTestingCommandTransactionsWithCompletionPolicy({
      profile: preset.profile,
      previousRuntimeStateVersion,
      maxRuns: preset.maxRuns,
      requiredStepCodes: preset.policy.requiredStepCodes,
      requireDispatchReady: preset.policy.requireDispatchReady,
      requireInteractiveTestReady: preset.policy.requireInteractiveTestReady,
      stableNextStepRuns: preset.policy.stableNextStepRuns,
    });
  };

  override getApkHoudokuTestingCompletionPolicyPresetRecommendation = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuTestingCompletionPolicyPresetRecommendation => {
    const runtimeQuickStatus = this.getApkRuntimeQuickStatus(previousRuntimeStateVersion);
    const integrationQuickStatus = this.getApkHoudokuIntegrationAutopilotQuickStatus(
      previousRuntimeStateVersion,
    );
    const recommendedStrictGate = this.runApkRecommendedStrictStartupGate('test');
    const dispatchReady = integrationQuickStatus.status === 'completed';
    const canRunInteractiveTest = dispatchReady && !runtimeQuickStatus.hasBlockingErrors;

    let recommendedProfile: ApkRuntimeStrictStartupProfile = 'test';
    const reasons: string[] = [];

    if (!dispatchReady || !canRunInteractiveTest) {
      recommendedProfile = 'dev';
      reasons.push(
        'Dispatch/test-interactive readiness is incomplete; use dev preset for fast iteration.',
      );
    } else if (runtimeQuickStatus.hasBlockingErrors || !recommendedStrictGate.passed) {
      recommendedProfile = 'test';
      reasons.push('Runtime signals are non-ideal; keep balanced test preset for verification.');
    } else {
      recommendedProfile = 'prod';
      reasons.push('Testing command dispatch and readiness signals are healthy; use prod preset.');
    }

    const recommendedPreset = this.getApkHoudokuTestingCompletionPolicyPreset(recommendedProfile);

    return {
      previousRuntimeStateVersion,
      recommendedProfile,
      recommendedPreset,
      reasons,
      overrideOptions: {
        profile: recommendedPreset.profile,
        previousRuntimeStateVersion,
        maxRuns: recommendedPreset.maxRuns,
        requiredStepCodes: recommendedPreset.policy.requiredStepCodes,
        requireDispatchReady: recommendedPreset.policy.requireDispatchReady,
        requireInteractiveTestReady: recommendedPreset.policy.requireInteractiveTestReady,
        stableNextStepRuns: recommendedPreset.policy.stableNextStepRuns,
      },
      signals: {
        dispatchReady,
        canRunInteractiveTest,
        hasBlockingErrors: runtimeQuickStatus.hasBlockingErrors,
        recommendedStrictGatePassed: recommendedStrictGate.passed,
      },
    };
  };

  override runApkHoudokuTestingCompletionPolicyPresetRecommendation = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuTestingCompletionPolicyPresetRunResult => {
    const recommendation = this.getApkHoudokuTestingCompletionPolicyPresetRecommendation(
      previousRuntimeStateVersion,
    );
    const result = this.runApkHoudokuNextTestingCommandTransactionsWithCompletionPolicy(
      recommendation.overrideOptions,
    );

    return {
      recommendation,
      result,
    };
  };

  override runApkHoudokuTestingAutopilotSession = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuTestingAutopilotSessionResult => {
    const run = this.runApkHoudokuTestingCompletionPolicyPresetRecommendation(
      previousRuntimeStateVersion,
    );

    const status: ApkHoudokuTestingAutopilotSessionResult['status'] = run.result.completed
      ? 'completed'
      : 'incomplete';
    const summary = run.result.completed
      ? `Testing autopilot completed with '${run.recommendation.recommendedProfile}' preset.`
      : `Testing autopilot incomplete with '${run.recommendation.recommendedProfile}' preset.`;
    const suggestedNextAction = run.result.completed
      ? 'none'
      : run.result.missingRequiredStepCodes.length > 0
        ? 'refresh-entry'
        : 'run-primary-action';

    return {
      previousRuntimeStateVersion,
      recommendation: run.recommendation,
      run,
      status,
      summary,
      suggestedNextAction,
    };
  };

  override getApkHoudokuTestingAutopilotQuickStatus = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuTestingAutopilotQuickStatus => {
    const digest = this.getApkRuntimeDigest();
    const runtimeQuickStatus = this.getApkRuntimeQuickStatus(previousRuntimeStateVersion);
    const recommendation = this.getApkHoudokuTestingCompletionPolicyPresetRecommendation(
      previousRuntimeStateVersion,
    );

    let status: ApkHoudokuTestingAutopilotQuickStatus['status'] = 'incomplete';
    let suggestedNextAction = 'run-primary-action';
    let reason = 'Testing quick status indicates additional testing actions are available.';

    if (runtimeQuickStatus.hasBlockingErrors) {
      suggestedNextAction = 'manual-remediation';
      reason = 'Runtime quick status has blocking errors that require attention.';
    } else if (
      recommendation.signals.dispatchReady &&
      recommendation.signals.canRunInteractiveTest &&
      recommendation.recommendedProfile !== 'dev'
    ) {
      status = 'completed';
      suggestedNextAction = 'none';
      reason = 'Testing command dispatch and interactive readiness signals are healthy.';
    }

    return {
      previousRuntimeStateVersion,
      runtimeStateVersion: digest.runtimeStateVersion,
      changed: runtimeQuickStatus.changed,
      runtimeQuickStatus,
      status,
      recommendedProfile: recommendation.recommendedProfile,
      suggestedNextAction,
      reason,
    };
  };

  override getApkHoudokuTestingExecutionSummary = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuTestingExecutionSummary => {
    const autopilotQuickStatus = this.getApkHoudokuTestingAutopilotQuickStatus(
      previousRuntimeStateVersion,
    );
    const completionRecommendation = this.getApkHoudokuTestingCompletionPolicyPresetRecommendation(
      previousRuntimeStateVersion,
    );

    const canStartInteractiveTest =
      autopilotQuickStatus.status === 'completed' ||
      (completionRecommendation.signals.dispatchReady &&
        completionRecommendation.signals.canRunInteractiveTest);

    let status: ApkHoudokuTestingExecutionSummary['status'] = 'needs-action';
    let suggestedNextAction = autopilotQuickStatus.suggestedNextAction;
    let reason = autopilotQuickStatus.reason;

    if (autopilotQuickStatus.runtimeQuickStatus.hasBlockingErrors) {
      status = 'blocked';
      suggestedNextAction = 'manual-remediation';
      reason = 'Runtime has blocking errors and testing cannot proceed safely.';
    } else if (canStartInteractiveTest) {
      status = 'ready';
      suggestedNextAction = 'start-houdoku-test';
      reason = 'Interactive Houdoku testing is ready to start.';
    }

    return {
      previousRuntimeStateVersion,
      runtimeStateVersion: autopilotQuickStatus.runtimeStateVersion,
      changed: autopilotQuickStatus.changed,
      status,
      canStartInteractiveTest,
      dispatchReady: completionRecommendation.signals.dispatchReady,
      suggestedNextAction,
      reason,
      autopilotQuickStatus,
      completionRecommendation,
    };
  };

  override runApkHoudokuTestingQuickStart = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuTestingQuickStartResult => {
    const beforeSummary = this.getApkHoudokuTestingExecutionSummary(previousRuntimeStateVersion);

    if (beforeSummary.status === 'ready') {
      return {
        previousRuntimeStateVersion,
        beforeSummary,
        actionRun: undefined,
        afterSummary: beforeSummary,
        ready: true,
        suggestedNextAction: 'start-houdoku-test',
        reason: 'Testing is already ready; no quick-start action was required.',
      };
    }

    const actionRun = this.runApkHoudokuTestingPrimaryAction(beforeSummary.runtimeStateVersion);
    const afterSummary = this.getApkHoudokuTestingExecutionSummary(
      actionRun.entryModel.runtimeDigest.runtimeStateVersion,
    );
    const ready = afterSummary.status === 'ready';

    return {
      previousRuntimeStateVersion,
      beforeSummary,
      actionRun,
      afterSummary,
      ready,
      suggestedNextAction: ready ? 'start-houdoku-test' : afterSummary.suggestedNextAction,
      reason: ready
        ? 'Quick-start executed and testing is now ready.'
        : 'Quick-start executed, but additional testing actions are still required.',
    };
  };

  override runApkHoudokuTestingFunctionalRun = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuTestingFunctionalRunResult => {
    const summary = this.getApkHoudokuTestingExecutionSummary(previousRuntimeStateVersion);
    const quickStart = this.runApkHoudokuTestingQuickStart(summary.runtimeStateVersion);
    const testingPreset = this.getApkHoudokuTestingPreset('test');
    const launchModel = this.getApkHoudokuLaunchModelWithOverrides({
      profile: 'test',
      previousRuntimeStateVersion: quickStart.afterSummary.runtimeStateVersion,
      overrides: testingPreset.overrides,
    });

    const readyForInteractiveTest = quickStart.ready && launchModel.canRunHoudokuTest;

    return {
      previousRuntimeStateVersion,
      summary,
      quickStart,
      launchModel,
      readyForInteractiveTest,
      suggestedNextAction: readyForInteractiveTest
        ? 'start-houdoku-test'
        : quickStart.suggestedNextAction,
      reason: readyForInteractiveTest
        ? 'Functional testing run is ready for interactive Houdoku testing.'
        : 'Functional testing run executed, but additional actions are still required.',
    };
  };

  override getApkHoudokuTestingDispatchModel = (
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuTestingDispatchModel => {
    const functionalRun = this.runApkHoudokuTestingFunctionalRun(previousRuntimeStateVersion);
    const nextCommandResult = this.preflightApkHoudokuNextTestingCommandSuggestion(
      functionalRun.quickStart.afterSummary.runtimeStateVersion,
    );
    const nextCommand = nextCommandResult.command;
    const dispatchMethod = nextCommand?.method;
    const dispatchArgsJson = nextCommand?.argsJson;
    const canDispatchCommand =
      nextCommand !== undefined &&
      nextCommandResult.preflight.allowlisted &&
      nextCommandResult.preflight.parsedArgsValid;
    const canStartInteractiveTest = functionalRun.readyForInteractiveTest;

    let suggestedClientAction: ApkHoudokuTestingDispatchModel['suggestedClientAction'] = 'wait';
    let reason = 'Await updated runtime state before executing the next client action.';

    if (canStartInteractiveTest) {
      suggestedClientAction = 'start-houdoku-test';
      reason = 'Interactive testing can start now.';
    } else if (canDispatchCommand) {
      suggestedClientAction = 'dispatch-command';
      reason = 'Dispatch-ready testing command is available for the next step.';
    }

    return {
      previousRuntimeStateVersion,
      functionalRun,
      nextCommand,
      dispatchMethod,
      dispatchArgsJson,
      canDispatchCommand,
      canStartInteractiveTest,
      suggestedClientAction,
      reason,
    };
  };

  private _executeAllowlistedHoudokuIntegrationCommand = (
    method: string,
    args: unknown[],
  ): void => {
    if (method === 'getApkHoudokuTestingModelWithOptions') {
      this.getApkHoudokuTestingModelWithOptions(...(args as [ApkHoudokuTestingModelOptions?]));
      return;
    }

    if (method === 'getApkHoudokuLaunchModel') {
      this.getApkHoudokuLaunchModel(...(args as [ApkRuntimeStrictStartupProfile?, string?]));
      return;
    }

    if (method === 'runApkHoudokuTestReady') {
      this.runApkHoudokuTestReady(...(args as [ApkHoudokuTestReadyOptions?]));
      return;
    }

    if (method === 'getApkStartupExecutionSummary') {
      this.getApkStartupExecutionSummary(...(args as [ApkRuntimeStrictStartupProfile?]));
      return;
    }

    if (method === 'getApkStartupRemediationPlan') {
      this.getApkStartupRemediationPlan(...(args as [ApkRuntimeStrictStartupProfile?]));
      return;
    }

    throw new Error(`Method '${method}' is not allowlisted for integration command dispatch.`);
  };

  override runApkHoudokuIntegrationCommandSuggestion = (
    command?: ApkHoudokuIntegrationCommandSuggestion,
    profile: ApkRuntimeStrictStartupProfile = 'test',
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuIntegrationCommandExecutionResult => {
    const fallbackStepExecution = this.runApkHoudokuIntegrationStep(
      profile,
      undefined,
      previousRuntimeStateVersion,
    );
    const preflight = this.preflightApkHoudokuIntegrationCommandSuggestion(
      command,
      profile,
      previousRuntimeStateVersion,
    );

    if (
      !preflight.allowlisted ||
      !preflight.parsedArgsValid ||
      preflight.normalizedMethod === undefined ||
      preflight.normalizedStepCode === undefined
    ) {
      return {
        profile,
        command,
        allowlisted: preflight.allowlisted,
        parsedArgsValid: preflight.parsedArgsValid,
        executed: false,
        error: preflight.error,
        stepExecution: fallbackStepExecution,
      };
    }

    try {
      this._executeAllowlistedHoudokuIntegrationCommand(
        preflight.normalizedMethod,
        preflight.parsedArgs || [],
      );
      const stepExecution = this.runApkHoudokuIntegrationStep(
        profile,
        preflight.normalizedStepCode,
        previousRuntimeStateVersion,
      );
      return {
        profile,
        command,
        allowlisted: true,
        parsedArgsValid: true,
        executed: true,
        error: undefined,
        stepExecution,
      };
    } catch (error) {
      return {
        profile,
        command,
        allowlisted: true,
        parsedArgsValid: true,
        executed: false,
        error: error instanceof Error ? error.message : 'Unknown command execution error.',
        stepExecution: fallbackStepExecution,
      };
    }
  };

  override runApkHoudokuNextIntegrationCommandSuggestion = (
    profile: ApkRuntimeStrictStartupProfile = 'test',
    previousRuntimeStateVersion?: string,
  ): ApkHoudokuNextIntegrationCommandExecutionResult => {
    const suggestions = this.getApkHoudokuIntegrationCommandSuggestions(
      profile,
      previousRuntimeStateVersion,
    );
    const command = suggestions.suggestions.find((entry) => entry.isNextStep);
    const execution = this.runApkHoudokuIntegrationCommandSuggestion(
      command,
      profile,
      previousRuntimeStateVersion,
    );

    return {
      profile,
      nextStep: suggestions.nextStep,
      command,
      execution,
    };
  };

  override getApkRuntimeState = (): ApkRuntimeState => {
    const runtimeConfig = this.getApkRuntimeConfig();
    const adapterSupportedSourceKeys = getSupportedApkAdapterSourceKeys();
    const apkExtensionsDirectory = this.getApkExtensionsDirectory();
    const apkExtensions = this.getApkExtensions();
    const sourceMappings = this.getApkSourceMappings();
    const selectionState = this.getApkSelectionState();
    const selectionRecommendations = this.getApkSelectionRecommendations();
    const activeMappings = this.getActiveApkMappings();
    const sourceGroups = this._buildApkSourceGroups(sourceMappings, selectionState, activeMappings);
    const sourceReadinessSummaries = this._buildApkSourceReadinessSummaries(
      sourceGroups,
      runtimeConfig,
    );
    const preferredSelectionCandidates = this._buildApkPreferredSelectionCandidates(
      sourceGroups,
      runtimeConfig,
    );
    const messages = this._getApkRuntimeMessages(
      apkExtensionsDirectory,
      sourceMappings,
      selectionState,
      activeMappings,
      runtimeConfig,
    );
    const diagnostics = this._getApkRuntimeDiagnostics(
      sourceMappings,
      selectionState,
      activeMappings,
    );
    const actionHints = this._buildApkRuntimeActionHints(
      sourceMappings,
      activeMappings,
      runtimeConfig,
      messages,
    );
    const healthSummary = this._buildApkRuntimeHealthSummary(
      sourceMappings,
      sourceGroups,
      activeMappings,
      messages,
      diagnostics,
    );

    const runtimeStateVersion = this._buildRuntimeStateVersion({
      runtimeConfig,
      adapterSupportedSourceKeys,
      healthSummary,
      actionHints,
      apkExtensionsDirectory,
      apkExtensions,
      sourceMappings,
      sourceGroups,
      sourceReadinessSummaries,
      preferredSelectionCandidates,
      selectionState,
      selectionRecommendations,
      activeMappings,
      messages,
      diagnostics,
    });

    return {
      runtimeStateVersion,
      runtimeConfig,
      adapterSupportedSourceKeys,
      healthSummary,
      actionHints,
      apkExtensionsDirectory,
      apkExtensions,
      sourceMappings,
      sourceGroups,
      sourceReadinessSummaries,
      preferredSelectionCandidates,
      selectionState,
      selectionRecommendations,
      activeMappings,
      messages,
      diagnostics,
    };
  };

  override getApkSourceGroups = (): ApkSourceGroup[] => {
    const sourceMappings = this.getApkSourceMappings();
    const selectionState = this.getApkSelectionState();
    const activeMappings = this.getActiveApkMappings();
    return this._buildApkSourceGroups(sourceMappings, selectionState, activeMappings);
  };

  override refreshApkRuntimeState = (): ApkRuntimeState => {
    this.refreshApkExtensions();
    return this.getApkRuntimeState();
  };

  private _getApkSelectionFilePath = () => {
    const configuredFilePath = process.env['TIYO_APK_SELECTION_FILE'];
    if (configuredFilePath !== undefined && configuredFilePath.length > 0) {
      return configuredFilePath;
    }

    return getDefaultApkSelectionFilePath();
  };

  override getApkExtensions = () => {
    if (this._apkExtensionsCache === undefined) {
      this._apkExtensionsCache = getApkExtensionInfoList(this.getApkExtensionsDirectory());
    }

    return this._apkExtensionsCache;
  };

  override refreshApkExtensions = () => {
    this._apkExtensionsCache = getApkExtensionInfoList(this.getApkExtensionsDirectory());
    this.cleanupApkSelectionState();
    return this._apkExtensionsCache;
  };

  private _areSelectionsEqual = (left: ApkSelectionState, right: ApkSelectionState): boolean => {
    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();

    if (leftKeys.length !== rightKeys.length) {
      return false;
    }

    return leftKeys.every((key, index) => {
      const rightKey = rightKeys[index];
      if (key !== rightKey) {
        return false;
      }

      const leftEntry = left[key];
      const rightEntry = right[key];
      return (
        leftEntry.selectedPackageName === rightEntry.selectedPackageName &&
        leftEntry.extensionId === rightEntry.extensionId
      );
    });
  };

  override cleanupApkSelectionState = (): ApkSelectionCleanupResult => {
    const persistedState = this._getPersistedSelectionState();
    const mappedBySource = this._getMappedBySource();

    const removed: { sourceKey: string; selectedPackageName: string }[] = [];
    const cleanedState = Object.entries(persistedState).reduce((acc, [sourceKey, selection]) => {
      const normalizedSourceKey = this._toSourceKey(sourceKey);
      const sourceEntries = mappedBySource[normalizedSourceKey] || [];
      const selectedEntry = this._getSelectedEntryByPackageName(
        sourceEntries,
        selection.selectedPackageName,
      );

      if (selectedEntry === undefined) {
        removed.push({
          sourceKey: normalizedSourceKey,
          selectedPackageName: selection.selectedPackageName,
        });
        return acc;
      }

      acc[normalizedSourceKey] = {
        selectedPackageName: selectedEntry.apk.packageName,
        extensionId: selectedEntry.extensionId,
      };

      return acc;
    }, {} as ApkSelectionState);

    if (!this._areSelectionsEqual(persistedState, cleanedState)) {
      this._setPersistedSelectionState(cleanedState);
    }

    return {
      removed,
      selectionState: cleanedState,
    };
  };

  private _getPersistedSelectionState = (): ApkSelectionState => {
    if (this._apkSelectionStateCache === undefined) {
      this._apkSelectionStateCache = readApkSelectionState(this._getApkSelectionFilePath());
    }

    return this._apkSelectionStateCache;
  };

  private _setPersistedSelectionState = (state: ApkSelectionState) => {
    this._apkSelectionStateCache = state;
    writeApkSelectionState(state, this._getApkSelectionFilePath());
  };

  private _getSourceKeyToExtensionInfo = () => {
    return buildSourceKeyToExtensionInfo(this._getBuiltInMetadataList());
  };

  private _buildVirtualExtensionId = (sourceKey: string): string => {
    return `apk.${this._toSourceKey(sourceKey)}`;
  };

  override getApkSourceMappings = (): ApkSourceMapping[] => {
    const sourceKeyMap = this._getSourceKeyToExtensionInfo();
    return this.getApkExtensions().map((apk) => {
      const canonicalSourceKey = toCanonicalSourceKey(apk.sourceKey);
      const mapped = sourceKeyMap[canonicalSourceKey];
      const extensionId = mapped?.id || this._buildVirtualExtensionId(canonicalSourceKey);
      const extensionName = mapped?.name || apk.sourceName;

      return {
        apk,
        extensionId,
        extensionName,
        supported: true,
      };
    });
  };

  override getApkUnneededExtensions = (): ApkUnneededExtensionCandidate[] => {
    const sourceMappings = this.getApkSourceMappings();
    const selectionState = this.getApkSelectionState();
    const candidates: ApkUnneededExtensionCandidate[] = [];

    sourceMappings
      .filter((mapping) => !mapping.supported)
      .forEach((mapping) => {
        const sourceKey = this._toSourceKey(mapping.apk.sourceKey);
        const selectedPackageName = selectionState[sourceKey]?.selectedPackageName;

        candidates.push({
          filePath: mapping.apk.filePath,
          fileName: mapping.apk.fileName,
          packageName: mapping.apk.packageName,
          sourceKey,
          version: mapping.apk.version,
          reason: 'unsupported-source',
          selectedPackageName,
        });
      });

    const groupedSupportedMappings = sourceMappings
      .filter((mapping) => mapping.supported)
      .reduce(
        (acc, mapping) => {
          const sourceKey = this._toSourceKey(mapping.apk.sourceKey);
          if (acc[sourceKey] === undefined) {
            acc[sourceKey] = [];
          }

          acc[sourceKey].push(mapping);
          return acc;
        },
        {} as { [sourceKey: string]: ApkSourceMapping[] },
      );

    Object.entries(groupedSupportedMappings).forEach(([sourceKey, mappings]) => {
      const selectedPackageName = selectionState[sourceKey]?.selectedPackageName;
      if (selectedPackageName === undefined) {
        return;
      }

      mappings
        .filter((mapping) => mapping.apk.packageName !== selectedPackageName)
        .forEach((mapping) => {
          candidates.push({
            filePath: mapping.apk.filePath,
            fileName: mapping.apk.fileName,
            packageName: mapping.apk.packageName,
            sourceKey,
            version: mapping.apk.version,
            reason: 'not-selected-duplicate',
            selectedPackageName,
          });
        });
    });

    return candidates.sort((left, right) => {
      const sourceCompare = left.sourceKey.localeCompare(right.sourceKey);
      if (sourceCompare !== 0) {
        return sourceCompare;
      }

      return left.fileName.localeCompare(right.fileName);
    });
  };

  override cleanupUnneededApkExtensions = (
    options: boolean | ApkUnneededExtensionCleanupOptions = false,
  ): ApkUnneededExtensionCleanupResult => {
    const apply = typeof options === 'boolean' ? options : options?.apply === true;
    const policy: ApkUnneededExtensionCleanupPolicy =
      typeof options === 'boolean' ? 'all-unneeded' : options?.policy || 'all-unneeded';
    const apkDirectory = this.getApkExtensionsDirectory();
    const normalizedDirectory = fs.realpathSync(apkDirectory);
    const normalizedDirectoryPrefix = `${normalizedDirectory}${path.sep}`;
    const allCandidates = this.getApkUnneededExtensions();
    const candidates =
      policy === 'unsupported-only'
        ? allCandidates.filter((entry) => entry.reason === 'unsupported-source')
        : allCandidates;

    const results: ApkUnneededExtensionCleanupEntry[] = candidates.map((candidate) => {
      if (!apply) {
        return {
          candidate,
          status: 'dry-run',
          error: undefined,
        };
      }

      try {
        if (!fs.existsSync(candidate.filePath)) {
          return {
            candidate,
            status: 'skipped-missing-file',
            error: undefined,
          };
        }

        const resolvedPath = fs.realpathSync(candidate.filePath);
        if (
          resolvedPath !== normalizedDirectory &&
          !resolvedPath.startsWith(normalizedDirectoryPrefix)
        ) {
          return {
            candidate,
            status: 'skipped-outside-directory',
            error: undefined,
          };
        }

        fs.unlinkSync(resolvedPath);
        return {
          candidate,
          status: 'removed',
          error: undefined,
        };
      } catch (error) {
        const errorText = error instanceof Error ? error.message : String(error);
        return {
          candidate,
          status: 'failed',
          error: errorText,
        };
      }
    });

    if (apply) {
      this.refreshApkExtensions();
      this.cleanupApkSelectionState();
    }

    const removedCount = results.filter((entry) => entry.status === 'removed').length;
    const failedCount = results.filter((entry) => entry.status === 'failed').length;
    const skippedCount =
      results.length -
      removedCount -
      failedCount -
      results.filter((entry) => entry.status === 'dry-run').length;

    return {
      apply,
      policy,
      apkDirectory,
      totalCandidates: candidates.length,
      removedCount,
      skippedCount,
      failedCount,
      results,
      unneededAfter: apply ? this.getApkUnneededExtensions() : candidates,
    };
  };

  private _getMappedBySource = () => {
    return this.getApkSourceMappings()
      .filter((entry) => entry.supported)
      .reduce(
        (acc, entry) => {
          const sourceKey = this._toSourceKey(entry.apk.sourceKey);
          if (acc[sourceKey] === undefined) {
            acc[sourceKey] = [];
          }
          acc[sourceKey].push(entry);
          return acc;
        },
        {} as { [sourceKey: string]: ApkSourceMapping[] },
      );
  };

  private _resolveSelectionState = (): {
    selectionState: ApkSelectionState;
    selectionSource: { [sourceKey: string]: 'default' | 'persisted' | 'env' };
    mappedBySource: { [sourceKey: string]: ApkSourceMapping[] };
  } => {
    const mappedBySource = this._getMappedBySource();
    const selectionState: ApkSelectionState = {};
    const selectionSource: { [sourceKey: string]: 'default' | 'persisted' | 'env' } = {};

    this._applyDefaultSelections(selectionState, mappedBySource, selectionSource);
    this._applyPersistedSelections(selectionState, mappedBySource, selectionSource);
    this._applyEnvSelections(
      selectionState,
      mappedBySource,
      process.env['TIYO_APK_SOURCE_SELECTION'],
      selectionSource,
    );

    return {
      selectionState,
      selectionSource,
      mappedBySource,
    };
  };

  private _parseVersionParts = (value: string | undefined): number[] => {
    if (value === undefined) {
      return [0];
    }

    return value
      .split('.')
      .map((part) => Number.parseInt(part, 10))
      .map((part) => (Number.isNaN(part) ? 0 : part));
  };

  private _compareVersionDesc = (left: string | undefined, right: string | undefined): number => {
    const leftParts = this._parseVersionParts(left);
    const rightParts = this._parseVersionParts(right);
    const maxLen = Math.max(leftParts.length, rightParts.length);

    for (let index = 0; index < maxLen; index += 1) {
      const leftPart = leftParts[index] || 0;
      const rightPart = rightParts[index] || 0;
      if (leftPart !== rightPart) {
        return rightPart - leftPart;
      }
    }

    return 0;
  };

  private _getSelectedEntryByPackageName = (
    sourceEntries: ApkSourceMapping[],
    packageName: string,
  ): ApkSourceMapping | undefined => {
    return sourceEntries.find((entry) => entry.apk.packageName === packageName);
  };

  private _assignSelection = (
    selectionState: ApkSelectionState,
    sourceKey: string,
    selectedEntry: ApkSourceMapping,
    selectionSource?: { [sourceKey: string]: 'default' | 'persisted' | 'env' },
    source?: 'default' | 'persisted' | 'env',
  ) => {
    selectionState[sourceKey] = {
      selectedPackageName: selectedEntry.apk.packageName,
      extensionId: selectedEntry.extensionId,
    };

    if (selectionSource !== undefined && source !== undefined) {
      selectionSource[sourceKey] = source;
    }
  };

  private _applyDefaultSelections = (
    selectionState: ApkSelectionState,
    mappedBySource: { [sourceKey: string]: ApkSourceMapping[] },
    selectionSource?: { [sourceKey: string]: 'default' | 'persisted' | 'env' },
  ) => {
    Object.entries(mappedBySource).forEach(([sourceKey, entries]) => {
      const sortedEntries = [...entries].sort((left, right) => {
        const versionCompare = this._compareVersionDesc(left.apk.version, right.apk.version);
        if (versionCompare !== 0) {
          return versionCompare;
        }
        return left.apk.fileName.localeCompare(right.apk.fileName);
      });

      const newestEntry = sortedEntries[0];
      if (newestEntry !== undefined) {
        this._assignSelection(selectionState, sourceKey, newestEntry, selectionSource, 'default');
      }
    });
  };

  private _applyPersistedSelections = (
    selectionState: ApkSelectionState,
    mappedBySource: { [sourceKey: string]: ApkSourceMapping[] },
    selectionSource?: { [sourceKey: string]: 'default' | 'persisted' | 'env' },
  ) => {
    const persistedState = this._getPersistedSelectionState();
    Object.entries(persistedState).forEach(([sourceKey, persistedSelection]) => {
      const sourceEntries = mappedBySource[this._toSourceKey(sourceKey)] || [];
      const selectedEntry = this._getSelectedEntryByPackageName(
        sourceEntries,
        persistedSelection.selectedPackageName,
      );
      if (selectedEntry !== undefined) {
        this._assignSelection(
          selectionState,
          this._toSourceKey(sourceKey),
          selectedEntry,
          selectionSource,
          'persisted',
        );
      }
    });
  };

  private _applyEnvSelections = (
    selectionState: ApkSelectionState,
    mappedBySource: { [sourceKey: string]: ApkSourceMapping[] },
    selectionRaw: string | undefined,
    selectionSource?: { [sourceKey: string]: 'default' | 'persisted' | 'env' },
  ) => {
    if (selectionRaw === undefined || selectionRaw.trim().length === 0) {
      return;
    }

    selectionRaw
      .split(';')
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0)
      .forEach((segment) => {
        const [sourceKeyRaw, packageNameRaw] = segment.split('=');
        if (sourceKeyRaw === undefined || packageNameRaw === undefined) {
          return;
        }

        const sourceKey = this._toSourceKey(sourceKeyRaw.trim());
        const packageName = packageNameRaw.trim();
        const sourceEntries = mappedBySource[sourceKey] || [];
        const selectedEntry = this._getSelectedEntryByPackageName(sourceEntries, packageName);
        if (selectedEntry !== undefined) {
          this._assignSelection(selectionState, sourceKey, selectedEntry, selectionSource, 'env');
        }
      });
  };

  override getApkSelectionState = (): ApkSelectionState => {
    return this._resolveSelectionState().selectionState;
  };

  override getApkSelectionRecommendations = (): ApkSelectionRecommendation[] => {
    const { mappedBySource, selectionState, selectionSource } = this._resolveSelectionState();

    return Object.entries(mappedBySource)
      .map(([sourceKey, sourceEntries]) => {
        const selection = selectionState[sourceKey];
        if (selection === undefined) {
          return undefined;
        }

        const selectedEntry = sourceEntries.find(
          (entry) => entry.apk.packageName === selection.selectedPackageName,
        );
        if (selectedEntry === undefined) {
          return undefined;
        }

        return {
          sourceKey,
          selectedPackageName: selectedEntry.apk.packageName,
          selectedVersion: selectedEntry.apk.version,
          reason: this._toSelectionReason(selectionSource[sourceKey] || 'default'),
        } as ApkSelectionRecommendation;
      })
      .filter((entry): entry is ApkSelectionRecommendation => entry !== undefined)
      .sort((left, right) => left.sourceKey.localeCompare(right.sourceKey));
  };

  override setApkSourceSelection = (
    sourceKey: string,
    selectedPackageName: string,
  ): ApkSelectionState => {
    const normalizedSourceKey = this._toSourceKey(sourceKey.trim());
    const normalizedPackageName = selectedPackageName.trim();
    if (normalizedSourceKey.length === 0 || normalizedPackageName.length === 0) {
      return this.getApkSelectionState();
    }

    const sourceEntries = this._getMappedBySource()[normalizedSourceKey] || [];
    const selectedEntry = this._getSelectedEntryByPackageName(sourceEntries, normalizedPackageName);
    if (selectedEntry === undefined) {
      return this.getApkSelectionState();
    }

    const currentPersisted = this._getPersistedSelectionState();
    const nextPersisted = {
      ...currentPersisted,
      [normalizedSourceKey]: {
        selectedPackageName: selectedEntry.apk.packageName,
        extensionId: selectedEntry.extensionId,
      },
    } as ApkSelectionState;

    this._setPersistedSelectionState(nextPersisted);
    return this.getApkSelectionState();
  };

  override clearApkSourceSelection = (sourceKey: string): ApkSelectionState => {
    const normalizedSourceKey = this._toSourceKey(sourceKey.trim());
    if (normalizedSourceKey.length === 0) {
      return this.getApkSelectionState();
    }

    const currentPersisted = this._getPersistedSelectionState();
    if (!(normalizedSourceKey in currentPersisted)) {
      return this.getApkSelectionState();
    }

    const nextPersisted = { ...currentPersisted };
    delete nextPersisted[normalizedSourceKey];
    this._setPersistedSelectionState(nextPersisted);
    return this.getApkSelectionState();
  };

  override getActiveApkMappings = (): ApkActiveMapping[] => {
    const selectionState = this.getApkSelectionState();
    const mappings = this.getApkSourceMappings();

    return Object.entries(selectionState)
      .map(([sourceKey, selection]) => {
        if (selection.extensionId === undefined) {
          return undefined;
        }

        const selectedMapping = mappings.find(
          (entry) =>
            this._toSourceKey(entry.apk.sourceKey) === sourceKey &&
            entry.apk.packageName === selection.selectedPackageName &&
            entry.extensionId === selection.extensionId,
        );
        if (selectedMapping === undefined || selectedMapping.extensionName === undefined) {
          return undefined;
        }

        return {
          sourceKey,
          selectedPackageName: selectedMapping.apk.packageName,
          extensionId: selectedMapping.extensionId,
          extensionName: selectedMapping.extensionName,
          filePath: selectedMapping.apk.filePath,
          version: selectedMapping.apk.version,
        } as ApkActiveMapping;
      })
      .filter((entry): entry is ApkActiveMapping => entry !== undefined)
      .sort((left, right) => left.sourceKey.localeCompare(right.sourceKey));
  };

  private _applyApkSelectionOverrides = <
    T extends { metadata: { id: string; name: string }; client: unknown },
  >(extensions: { [key: string]: T }) => {
    const activeMappings = this.getActiveApkMappings();

    activeMappings.forEach((mapping) => {
      const extension = extensions[mapping.extensionId];
      if (extension === undefined) {
        return;
      }

      const profile = getApkAdapterProfile(mapping);
      const labeledName =
        profile?.metadataName ||
        (mapping.version
          ? `${extension.metadata.name} (APK ${mapping.version})`
          : `${extension.metadata.name} (APK)`);

      extensions[mapping.extensionId] = {
        ...extension,
        metadata: {
          ...extension.metadata,
          name: labeledName,
        },
      };
    });

    return extensions;
  };

  private _applyApkAdapterProfiles = <
    T extends {
      metadata: { id: string; name: string };
      client: { setSettings?: (settings: { [key: string]: unknown }) => void };
    },
  >(extensions: { [key: string]: T }) => {
    const activeMappings = this.getActiveApkMappings();

    activeMappings.forEach((mapping) => {
      const extension = extensions[mapping.extensionId];
      if (extension === undefined) {
        return;
      }

      const profile = getApkAdapterProfile(mapping);
      if (profile === undefined) {
        return;
      }

      if (typeof extension.client.setSettings === 'function') {
        extension.client.setSettings(profile.settingsOverride);
      }
    });

    return extensions;
  };

  private _applyApkModeFiltering = <T extends { metadata: { id: string } }>(extensions: {
    [key: string]: T;
  }) => {
    const allowedIds = this._getApkModeAllowedExtensionIds();
    if (allowedIds === undefined) {
      return extensions;
    }

    return Object.fromEntries(
      Object.entries(extensions).filter(([extensionId]) => allowedIds.has(extensionId)),
    ) as { [key: string]: T };
  };

  private _getApkModeAllowedExtensionIds = (): Set<string> | undefined => {
    const runtimeConfig = this.getApkRuntimeConfig();
    if (runtimeConfig.apkOnlyMode !== true && runtimeConfig.adapterRequiredMode !== true) {
      return undefined;
    }

    const activeMappings = this.getActiveApkMappings();
    const adapterEligibleMappings = this._getAdapterEligibleMappings(activeMappings);

    return new Set(
      (runtimeConfig.adapterRequiredMode === true ? adapterEligibleMappings : activeMappings).map(
        (mapping) => mapping.extensionId,
      ),
    );
  };

  private _createExtensionEntry = <
    T extends { METADATA: ExtensionMetadata } & {
      ExtensionClient: new (webviewFn: WebviewFunc) => ExtensionClientInterface;
    },
  >(
    extensionModule: T,
  ) => {
    return {
      metadata: extensionModule.METADATA,
      client: new extensionModule.ExtensionClient(this._webviewFn),
    };
  };

  private _createVirtualExtensionEntry = (mapping: ApkActiveMapping) => {
    const extensionLabel =
      mapping.version !== undefined
        ? `${mapping.extensionName} (APK ${mapping.version})`
        : `${mapping.extensionName} (APK)`;

    const virtualClient = {
      webviewFn: this._webviewFn,
      settings: {},
      getSeries: async () => undefined,
      getChapters: async () => [],
      getPageRequesterData: async () => ({
        server: '',
        hash: '',
        numPages: 0,
        pageFilenames: [],
      }),
      getPageUrls: () => [],
      getImage: async () => '',
      getSearch: async () => ({ seriesList: [], hasMore: false }),
      getDirectory: async () => ({ seriesList: [], hasMore: false }),
      getSettingTypes: () => ({}),
      getSettings: () => ({}),
      setSettings: () => undefined,
      getFilterOptions: () => [],
      getExternalExtensions: () => ({
        [ExternalClient.TACHIYOMI]: [],
      }),
      convertExternalData: () => ({
        series: undefined,
        chapters: [],
        messages: [
          {
            text: `Source '${mapping.sourceKey}' is mapped from APK and ready for selection.`,
            type: 'info' as const,
          },
        ],
      }),
    } as ExtensionClientInterface;

    return {
      metadata: {
        id: mapping.extensionId,
        name: extensionLabel,
        url: `apk://${mapping.sourceKey}`,
        translatedLanguage: undefined,
      } as ExtensionMetadata,
      client: virtualClient,
    };
  };

  private _buildVirtualExtensions = (allowedIds?: Set<string>) => {
    const builtInIds = new Set(this._getBuiltInMetadataList().map((metadata) => metadata.id));

    return this.getActiveApkMappings().reduce(
      (acc, mapping) => {
        if (allowedIds !== undefined && !allowedIds.has(mapping.extensionId)) {
          return acc;
        }

        if (builtInIds.has(mapping.extensionId)) {
          return acc;
        }

        if (acc[mapping.extensionId] !== undefined) {
          return acc;
        }

        acc[mapping.extensionId] = this._createVirtualExtensionEntry(mapping);
        return acc;
      },
      {} as {
        [key: string]: { metadata: ExtensionMetadata; client: ExtensionClientInterface };
      },
    );
  };

  private _buildBaseExtensions = (allowedIds?: Set<string>) => {
    const extensionModules = [
      anatanomotokare,
      arcrelight,
      assortedscans,
      comick,
      deathtollscans,
      disasterscans,
      guya,
      hniscantrad,
      immortalupdates,
      isekaiscan,
      kireicake,
      komga,
      komikcast,
      kouhaiwork,
      lecercleduscan,
      leviatanscans,
      lilyreader,
      lupiteam,
      manga347,
      mangabat,
      mangadex,
      mangakakalot,
      mangakatana,
      mangakik,
      mangalife,
      manganato,
      mangapill,
      mangasee,
      mangatellers,
      menudofansub,
      nana,
      nhentai,
      nifteam,
      phoenixscans,
      readcomiconline,
      sensescans,
      silentsky,
      sleepingknightscans,
      tcbscans,
      toonily,
      tortugaceviri,
      tritiniascans,
      tuttoanimemanga,
      yuriism,
      zandynofansub,
    ] as const;

    const baseExtensions = extensionModules.reduce(
      (acc, extensionModule) => {
        if (allowedIds !== undefined && !allowedIds.has(extensionModule.METADATA.id)) {
          return acc;
        }

        acc[extensionModule.METADATA.id] = this._createExtensionEntry(extensionModule);
        return acc;
      },
      {} as {
        [key: string]: { metadata: ExtensionMetadata; client: ExtensionClientInterface };
      },
    );

    return {
      ...baseExtensions,
      ...this._buildVirtualExtensions(allowedIds),
    };
  };

  override getExtensions = () => {
    const allowedIds = this._getApkModeAllowedExtensionIds();
    const baseExtensions = this._buildBaseExtensions(allowedIds);
    return this._applyApkModeFiltering(
      this._applyApkAdapterProfiles(this._applyApkSelectionOverrides(baseExtensions)),
    );
  };
}

export type HoudokuMainProgramRunnerOptions = {
  targetDirectory?: string;
  sourceKey?: string;
  requestedPackageName?: string;
  profile?: ApkRuntimeStrictStartupProfile;
};

export type HoudokuMainProgramRunner = {
  client: TiyoClient;
  run: (overrides?: ApkHoudokuMainProgramMethodOptions) => ApkHoudokuMainProgramMethodResult;
};

export const createHoudokuMainProgramRunner = (
  options?: HoudokuMainProgramRunnerOptions,
): HoudokuMainProgramRunner => {
  const client = new TiyoClient({} as BrowserWindow);
  let previousRuntimeStateVersion: string | undefined = undefined;

  const run = (
    overrides?: ApkHoudokuMainProgramMethodOptions,
  ): ApkHoudokuMainProgramMethodResult => {
    const result = client.runApkHoudokuMainProgramMethod({
      targetDirectory: overrides?.targetDirectory || options?.targetDirectory,
      sourceKey: overrides?.sourceKey || options?.sourceKey,
      requestedPackageName: overrides?.requestedPackageName || options?.requestedPackageName,
      profile: overrides?.profile || options?.profile,
      previousRuntimeStateVersion:
        overrides?.previousRuntimeStateVersion || previousRuntimeStateVersion,
    });

    previousRuntimeStateVersion = result.pollingUpdate.runtimeStateVersion;
    return result;
  };

  return {
    client,
    run,
  };
};
